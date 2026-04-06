# 🍽️ Smart Restaurant Queue Management System (Data-Driven)

A real-time restaurant queue management system designed with a **data-first approach** to optimize customer flow, reduce wait times, and improve table utilization using analytics.

Built to track operational metrics, manage queues, and send notifications to customers.

---

## 🎯 Project Objective

Design and implement a system that:

* Manages restaurant queues efficiently
* Captures operational data
* Enables better decision-making
* Optimizes table utilization

---

## 📊 Key Data Insights & Features

### ⏱️ Wait Time Estimation

* Calculates estimated waiting time based on queue position

### 📈 Real-Time Metrics Dashboard

Tracks:

* Guests seated
* Customers in queue
* Table availability
* Average wait time
* Daily completed bookings

### 🪑 Table Utilization Analysis

* Uses best-fit logic for efficient table allocation

### 🔄 Dynamic Queue Management

* Automatically updates queue positions and wait times

### 📲 Customer Notification System

* Sends SMS alerts when a table is ready

### 📉 Data-Driven Approach

Captures:

* Customer arrival patterns
* Group sizes
* Waiting times
* Table occupancy duration

Used to:

* Identify peak hours
* Analyze wait time trends
* Optimize allocation strategies

---

## 🛠️ Tech Stack

### 🔹 Backend

* Python (Flask)
* SQLite

### 🔹 Frontend

* React.js (Vite)
* Axios

### 🔹 Real-Time Communication

* Socket.IO

### 🔹 External Integration

* Twilio (SMS Notifications)

---

## ⚙️ System Workflow

1. Customer enters details (name, phone, group size)
2. System checks table availability
3. If available → table assigned instantly
4. If not → customer added to queue
5. Queue positions and wait times update dynamically
6. When a table becomes free → next customer is assigned
7. SMS notification sent to the customer

---

## 📦 Project Structure

```text
restaurant_queue/
├── backend/
│   ├── .env                 # Environment variables
│   ├── app.py               # Flask API + Socket.IO + DB logic
│   ├── restaurant.db        # SQLite database
│   └── requirements.txt     # Dependencies
│
├── frontend/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── utils/
│       │   └── api.js
│       ├── hooks/
│       │   └── useRealtime.js
│       ├── components/
│       │   └── Sidebar.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── NewBooking.jsx
│           ├── Queue.jsx
│           ├── Tables.jsx
│           ├── AdminPanel.jsx
│           └── SmsLog.jsx
│
└── setup.sh
```

---

## 📡 Sample API Endpoints

* `GET /api/tables` → Fetch table data
* `GET /api/bookings` → Fetch booking records
* `POST /api/bookings` → Add new customer
* `POST /api/bookings/{id}/assign` → Assign table
* `POST /api/bookings/{id}/checkout` → Complete booking
* `POST /api/bookings/{id}/notify` → Send SMS

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Sakshichikhale1/restaurant-queue-system.git
cd restaurant-queue-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# OR
source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create `.env` file:

```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=your_number
```

Run server:

```bash
python app.py
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 📈 Potential Data Analysis Use Cases

* Peak hour identification
* Average wait time vs group size
* Table utilization efficiency
* Customer flow patterns
* Queue length trends

---

## 🚀 Future Enhancements

* Interactive dashboards (Power BI / Tableau)
* Predictive wait time modeling
* Advanced analytics & reporting
* Cloud deployment for real-time monitoring
* Authentication & admin panel
* Billing integration
<img width="1919" height="905" alt="Screenshot 2026-04-05 163724" src="https://github.com/user-attachments/assets/495de5f1-05fb-4bb1-9c29-50a814212022" />

<img width="1906" height="877" alt="Screenshot 2026-04-05 163455" src="https://github.com/user-attachments/assets/770e4476-ecec-4661-9cc9-f7b9884ac603" />

<img width="1903" height="887" alt="Screenshot 2026-04-05 163801" src="https://github.com/user-attachments/assets/a2eb921c-3dec-4985-a6a3-298ca6cb2fb4" />

<img width="1914" height="914" alt="Screenshot 2026-04-05 163948" src="https://github.com/user-attachments/assets/b89817fd-4237-450f-bbb1-6f2046104202" />

<img width="1883" height="873" alt="Screenshot 2026-04-05 164001" src="https://github.com/user-attachments/assets/8837787f-7517-4cc3-87ea-c347a81e141f" />

<img width="1911" height="859" alt="Screenshot 2026-04-05 164031" src="https://github.com/user-attachments/assets/ae99047e-14ee-4d74-9c25-e3b75d6fb0a5" />

<img width="213" height="461" alt="Screenshot 2026-04-05 164219" src="https://github.com/user-attachments/assets/791edd00-e3d7-49b5-84ae-9bf9a86e05e2" />










---



## 👩‍💻 Author

**Sakshi Chikhale**

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
