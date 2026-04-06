import React, { useEffect, useState, useCallback } from 'react'
import { Bell, LogOut, Table2, RefreshCw, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBookings, getTables, assignTable, checkout, notify } from '../utils/api'
import { useRealtime } from '../hooks/useRealtime'

export default function AdminPanel() {
  const [bookings, setBookings]   = useState([])
  const [tables,   setTables]     = useState([])
  const [filter,   setFilter]     = useState('all')
  const [loading,  setLoading]    = useState(true)
  const [assigning, setAssigning] = useState(null)
  const [acting,   setActing]     = useState(null)

  const load = useCallback(async () => {
    try {
      const [b, t] = await Promise.all([
        getBookings(filter === 'all' ? undefined : filter),
        getTables()
      ])
      setBookings(b.data)
      setTables(t.data)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useRealtime(load)
  useEffect(() => { setLoading(true); load() }, [load])

  const handleCheckout = async (id) => {
    setActing(id)
    try {
      const { data } = await checkout(id)
      toast.success(
        data.auto_assigned
          ? 'Checked out — next party auto-assigned!'
          : 'Checked out successfully.',
        { className:'toast-custom' }
      )
      load()
    } catch {
      toast.error('Checkout failed', { className:'toast-custom' })
    } finally { setActing(null) }
  }

  const handleAssign = async (bookingId, tableId) => {
    try {
      await assignTable(bookingId, tableId)
      toast.success('Table assigned!', { className:'toast-custom' })
      setAssigning(null)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error', { className:'toast-custom' })
    }
  }

  const handleNotify = async (id) => {
    try {
      await notify(id)
      toast.success('SMS sent!', { className:'toast-custom' })
    } catch { toast.error('SMS failed', { className:'toast-custom' }) }
  }

  const FILTERS = [
    { id: 'all',       label: 'All' },
    { id: 'waiting',   label: 'Waiting' },
    { id: 'seated',    label: 'Seated' },
    { id: 'completed', label: 'Completed' },
  ]

  const statusColor = s => ({
    waiting:   'var(--amber)',
    seated:    'var(--sage-light)',
    completed: 'rgba(245,239,227,0.35)',
  }[s] || 'var(--parchment)')

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <div className="page-subtitle">Full booking control · {bookings.length} records</div>
        </div>
        <button className="btn btn-ghost" onClick={() => { setLoading(true); load() }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
        <Filter size={14} style={{ color:'rgba(245,239,227,0.4)' }} />
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`btn btn-sm ${filter===f.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{width:32,height:32}} /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state"><p>No bookings found</p></div>
      ) : (
        <div className="card animate-in" style={{ padding:0, overflow:'hidden' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background:'rgba(0,0,0,0.2)' }}>
                <th>ID</th>
                <th>Guest</th>
                <th>Phone</th>
                <th>Size</th>
                <th>Status</th>
                <th>Table</th>
                <th>Queue #</th>
                <th>Wait</th>
                <th>Booked At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <React.Fragment key={b.id}>
                  <tr>
                    <td><span className="mono" style={{ color:'rgba(245,239,227,0.35)', fontSize:'0.78rem' }}>#{b.id}</span></td>
                    <td style={{ fontWeight:600, minWidth:130 }}>{b.customer_name}</td>
                    <td><span className="mono" style={{ fontSize:'0.78rem', color:'rgba(245,239,227,0.5)' }}>{b.phone}</span></td>
                    <td>{b.group_size}p</td>
                    <td>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.table_name
                        ? <span className="badge badge-seated">{b.table_name}</span>
                        : <span style={{ color:'rgba(245,239,227,0.25)', fontSize:'0.88rem' }}>—</span>
                      }
                    </td>
                    <td>
                      {b.queue_position
                        ? <span style={{ fontFamily:'DM Mono', fontSize:'0.78rem', color:'var(--gold)' }}>#{b.queue_position}</span>
                        : <span style={{ color:'rgba(245,239,227,0.2)' }}>—</span>
                      }
                    </td>
                    <td>
                      {b.estimated_wait > 0
                        ? <span style={{ fontFamily:'DM Mono', fontSize:'0.78rem', color:'#e89550' }}>~{b.estimated_wait}m</span>
                        : <span style={{ color:'rgba(245,239,227,0.2)' }}>—</span>
                      }
                    </td>
                    <td><span className="mono" style={{ fontSize:'0.72rem', color:'rgba(245,239,227,0.4)' }}>{b.created_at?.slice(0,16)}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:5 }}>
                        {b.status === 'waiting' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setAssigning(assigning === b.id ? null : b.id)}
                          >
                            <Table2 size={12} />
                          </button>
                        )}
                        {(b.status === 'waiting' || b.status === 'seated') && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleNotify(b.id)}
                            title="Send SMS"
                          >
                            <Bell size={12} />
                          </button>
                        )}
                        {b.status === 'seated' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCheckout(b.id)}
                            disabled={acting === b.id}
                            title="Checkout"
                          >
                            {acting === b.id ? <div className="spinner" style={{width:12,height:12,borderWidth:1.5}} /> : <LogOut size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline table assign for waiting bookings */}
                  {assigning === b.id && (
                    <tr style={{ background:'rgba(201,168,76,0.04)' }}>
                      <td colSpan={10} style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                          <span style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'rgba(201,168,76,0.7)', letterSpacing:'0.1em' }}>
                            ASSIGN TABLE ({b.group_size} pax needed):
                          </span>
                          {tables
                            .filter(t => t.status === 'free' && t.capacity >= b.group_size)
                            .map(t => (
                              <button
                                key={t.id}
                                className="btn btn-success btn-sm"
                                onClick={() => handleAssign(b.id, t.id)}
                              >
                                {t.name} ({t.capacity}p)
                              </button>
                            ))
                          }
                          {tables.filter(t => t.status==='free' && t.capacity>=b.group_size).length===0 && (
                            <span style={{ color:'rgba(245,239,227,0.35)', fontStyle:'italic', fontSize:'0.88rem' }}>
                              No suitable free tables.
                            </span>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => setAssigning(null)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}