import React, { useEffect, useState, useCallback } from 'react'
import { Clock, Users, Table2, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBookings, getTables, assignTable, notify } from '../utils/api'
import { useRealtime } from '../hooks/useRealtime'

export default function Queue() {
  const [tab,      setTab]      = useState('waiting')
  const [bookings, setBookings] = useState([])
  const [tables,   setTables]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [assigning, setAssigning] = useState(null)  // booking id being assigned

  const load = useCallback(async () => {
    try {
      const [b, t] = await Promise.all([getBookings(tab), getTables()])
      setBookings(b.data)
      setTables(t.data.filter(t => t.status === 'free'))
    } finally {
      setLoading(false)
    }
  }, [tab])

  useRealtime(load)
  useEffect(() => { setLoading(true); load() }, [load])

  const handleAssign = async (bookingId, tableId) => {
    try {
      await assignTable(bookingId, tableId)
      toast.success('Table assigned!', { className:'toast-custom' })
      setAssigning(null)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error assigning table', { className:'toast-custom' })
    }
  }

  const handleNotify = async (bookingId) => {
    try {
      const { data } = await notify(bookingId)
      toast.success('SMS sent!', { className:'toast-custom' })
    } catch {
      toast.error('SMS failed', { className:'toast-custom' })
    }
  }

  const TABS = [
    { id: 'waiting',   label: 'Waiting' },
    { id: 'seated',    label: 'Seated' },
    { id: 'completed', label: 'Completed' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Queue</h1>
        <div className="page-subtitle">Live wait list · FIFO order</div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{width:32,height:32}} /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} />
          <p>No {tab} bookings</p>
        </div>
      ) : (
        <div className="card animate-in">
          <table className="data-table">
            <thead>
              <tr>
                {tab === 'waiting' && <th>Pos.</th>}
                <th>ID</th>
                <th>Guest</th>
                <th>Phone</th>
                <th>Size</th>
                {tab === 'waiting'   && <th>Est. Wait</th>}
                {tab === 'seated'    && <th>Table</th>}
                {tab === 'seated'    && <th>Seated At</th>}
                {tab === 'completed' && <th>Table</th>}
                {tab === 'completed' && <th>Completed</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <React.Fragment key={b.id}>
                  <tr>
                    {tab === 'waiting' && (
                      <td>
                        <div style={{
                          width:28, height:28,
                          borderRadius:'50%',
                          background: 'rgba(201,168,76,0.12)',
                          border: '1px solid rgba(201,168,76,0.35)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'DM Mono', fontSize:'0.72rem', color:'var(--gold)',
                          fontWeight:500
                        }}>
                          {b.queue_position}
                        </div>
                      </td>
                    )}
                    <td><span className="mono" style={{ color:'rgba(245,239,227,0.45)' }}>#{b.id}</span></td>
                    <td style={{ fontWeight:600 }}>{b.customer_name}</td>
                    <td><span className="mono" style={{ fontSize:'0.8rem', color:'rgba(245,239,227,0.55)' }}>{b.phone}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:4, color:'rgba(245,239,227,0.7)' }}>
                        <Users size={13} /> {b.group_size}
                      </div>
                    </td>
                    {tab === 'waiting' && (
                      <td><span className="badge badge-waiting">~{b.estimated_wait}m</span></td>
                    )}
                    {tab === 'seated' && (
                      <>
                        <td><span className="badge badge-seated">{b.table_name || '—'}</span></td>
                        <td><span className="mono" style={{ fontSize:'0.78rem', color:'rgba(245,239,227,0.5)' }}>{b.seated_at?.slice(11,16)}</span></td>
                      </>
                    )}
                    {tab === 'completed' && (
                      <>
                        <td><span style={{ color:'rgba(245,239,227,0.4)', fontSize:'0.9rem' }}>{b.table_name || '—'}</span></td>
                        <td><span className="mono" style={{ fontSize:'0.78rem', color:'rgba(245,239,227,0.4)' }}>{b.completed_at?.slice(0,16)}</span></td>
                      </>
                    )}
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {tab === 'waiting' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setAssigning(assigning === b.id ? null : b.id)}
                            >
                              <Table2 size={13} /> Assign Table
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleNotify(b.id)}
                            >
                              <Bell size={13} /> SMS
                            </button>
                          </>
                        )}
                        {tab === 'seated' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleNotify(b.id)}
                          >
                            <Bell size={13} /> Resend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline table selector */}
                  {assigning === b.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0 0 16px 0' }}>
                        <div style={{
                          background:'rgba(201,168,76,0.06)',
                          border:'1px solid rgba(201,168,76,0.2)',
                          borderRadius:6,
                          padding:'14px 16px',
                          margin:'4px 14px',
                        }}>
                          <div className="form-label" style={{ marginBottom:10 }}>Select a free table for {b.customer_name} ({b.group_size} pax)</div>
                          {tables.length === 0 ? (
                            <div style={{ color:'rgba(245,239,227,0.4)', fontStyle:'italic', fontSize:'0.9rem' }}>No free tables available right now.</div>
                          ) : (
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                              {tables
                                .filter(t => t.capacity >= b.group_size)
                                .map(t => (
                                  <button
                                    key={t.id}
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleAssign(b.id, t.id)}
                                  >
                                    {t.name} ({t.capacity} seats)
                                  </button>
                                ))
                              }
                              {tables.filter(t => t.capacity >= b.group_size).length === 0 && (
                                <div style={{ color:'rgba(245,239,227,0.4)', fontStyle:'italic', fontSize:'0.9rem' }}>
                                  No tables with enough capacity right now.
                                </div>
                              )}
                            </div>
                          )}
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