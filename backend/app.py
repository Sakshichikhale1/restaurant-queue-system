from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sqlite3
import os
from datetime import datetime
import threading
from twilio.rest import Client
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'restaurant-queue-secret-2024'

CORS(app, origins="*")
import os

async_mode = "eventlet" if os.environ.get("RENDER") else "threading"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)

DB_PATH = os.path.join(os.path.dirname(__file__), 'restaurant.db')

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'free'
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            group_size INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'waiting',
            table_id INTEGER REFERENCES tables(id),
            queue_position INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            seated_at TEXT,
            completed_at TEXT,
            estimated_wait INTEGER DEFAULT 0,
            sms_sent INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sms_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER REFERENCES bookings(id),
            message TEXT NOT NULL,
            sent_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );
        """)

        count = conn.execute("SELECT COUNT(*) FROM tables").fetchone()[0]
        if count == 0:
            tables = [
                ('T1', 2), ('T2', 2), ('T3', 4), ('T4', 4),
                ('T5', 4), ('T6', 6), ('T7', 6), ('T8', 8),
            ]
            conn.executemany(
                "INSERT INTO tables (name, capacity) VALUES (?,?)", tables
            )
        conn.commit()


# ✅ VERY IMPORTANT for Render (runs on import)
init_db()

# ---------------------------------------------------------------------------
# SMS helper
# ---------------------------------------------------------------------------

def twilio_send(phone: str, message: str) -> bool:
    try:
        client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )

        client.messages.create(
            to=phone,
            from_=os.getenv("TWILIO_FROM_NUMBER"),
            body=message
        )

        print(f"✅ SMS sent to {phone}")
        return True

    except Exception as e:
        print(f"❌ SMS failed: {e}")
        return False


def send_sms(booking_id: int, phone: str, message: str):
    if twilio_send(phone, message):
        with get_db() as conn:
            conn.execute(
                "INSERT INTO sms_log (booking_id, message) VALUES (?,?)",
                (booking_id, message)
            )
            conn.execute(
                "UPDATE bookings SET sms_sent=1 WHERE id=?", (booking_id,)
            )
            conn.commit()


# ---------------------------------------------------------------------------
# Business logic
# ---------------------------------------------------------------------------

def recalculate_queue_positions():
    with get_db() as conn:
        waiting = conn.execute(
            "SELECT id FROM bookings WHERE status='waiting' ORDER BY created_at"
        ).fetchall()

        for pos, row in enumerate(waiting, start=1):
            conn.execute(
                "UPDATE bookings SET queue_position=?, estimated_wait=? WHERE id=?",
                (pos, (pos - 1) * 15, row['id'])
            )
        conn.commit()


def find_best_table(group_size: int, conn):
    return conn.execute(
        """
        SELECT * FROM tables
        WHERE status='free' AND capacity >= ?
        ORDER BY capacity ASC
        LIMIT 1
        """,
        (group_size,)
    ).fetchone()


def try_assign_next_in_queue():
    with get_db() as conn:
        next_booking = conn.execute(
            "SELECT * FROM bookings WHERE status='waiting' ORDER BY created_at LIMIT 1"
        ).fetchone()

        if not next_booking:
            return None

        table = find_best_table(next_booking['group_size'], conn)
        if not table:
            return None

        conn.execute(
            "UPDATE tables SET status='occupied' WHERE id=?", (table['id'],)
        )
        conn.execute(
            """
            UPDATE bookings
            SET status='seated', table_id=?, seated_at=datetime('now','localtime')
            WHERE id=?
            """,
            (table['id'], next_booking['id'])
        )
        conn.commit()

        recalculate_queue_positions()

        msg = f"Hi {next_booking['customer_name']}! Your table ({table['name']}) is ready."
        threading.Thread(
            target=send_sms,
            args=(next_booking['id'], next_booking['phone'], msg),
            daemon=True
        ).start()

        return dict(next_booking)


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

@app.get('/api/tables')
def get_tables():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM tables").fetchall()
    return jsonify([dict(r) for r in rows])


@app.get('/api/bookings')
def get_bookings():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM bookings ORDER BY created_at ASC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.post('/api/bookings')
def create_booking():
    data = request.get_json()

    name = data.get('customer_name')
    phone = data.get('phone')
    group_size = int(data.get('group_size', 1))

    with get_db() as conn:
        table = find_best_table(group_size, conn)

        if table:
            conn.execute("UPDATE tables SET status='occupied' WHERE id=?", (table['id'],))
            booking_id = conn.execute(
                "INSERT INTO bookings (customer_name, phone, group_size, status, table_id) VALUES (?,?,?,?,?)",
                (name, phone, group_size, 'seated', table['id'])
            ).lastrowid
            conn.commit()

            socketio.emit('booking_update', {'updated': True})

            return jsonify({'status': 'seated', 'booking_id': booking_id})

        else:
            booking_id = conn.execute(
                "INSERT INTO bookings (customer_name, phone, group_size) VALUES (?,?,?)",
                (name, phone, group_size)
            ).lastrowid
            conn.commit()

            recalculate_queue_positions()

            socketio.emit('booking_update', {'updated': True})

            return jsonify({'status': 'waiting', 'booking_id': booking_id})


# ---------------------------------------------------------------------------
# Socket events
# ---------------------------------------------------------------------------

@socketio.on('connect')
def on_connect():
    print(f"Client connected: {request.sid}")


@socketio.on('disconnect')
def on_disconnect():
    print(f"Client disconnected: {request.sid}")


# ---------------------------------------------------------------------------
# Entry 
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)