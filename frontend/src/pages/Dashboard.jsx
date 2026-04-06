import React, { useEffect, useState, useCallback } from 'react'
import { Users, Table2, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { getStats, getBookings, getTables } from '../utils/api'
import { useRealtime } from '../hooks/useRealtime'

function StatTile({ value, label, icon: Icon, accent }) {
  return (
    <div className="stat-tile animate-in" style={{ '--accent': accent }}>
      <div className="stat-icon"><Icon size={42} /></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [waiting,  setWaiting]  = useState([])
  const [tables,   setTables]   = useState([])
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async () => {
    try {
      const [s, q, t] = await Promise.all([
        getStats(), getBookings('waiting'), getTables()
      ])
      setStats(s.data)
      setWaiting(q.data.slice(0, 6))
      setTables(t.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useRealtime(load)
  useEffect(() => { load() }, [load])

  // ✅ Dynamic Greeting Logic
  const hour = new Date().getHours()

  let greeting = ""
  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning"
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon"
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening"
  } else {
    greeting = "Good Night"
  }

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  )

  const { seated=0, waiting: wCount=0, free_tables=0, total_tables=0, completed=0, avg_wait_min=0 } = stats || {}

  return (
    <div className="page">
      <div className="page-header">
        {/* ✅ Updated here */}
        <h1 className="page-title">{greeting}</h1>

        <div className="page-subtitle">
          Live operations · {new Date().toLocaleDateString('en-IN', {
            weekday:'long',
            day:'numeric',
            month:'long'
          })}
        </div>
      </div>

      <div className="stats-grid stagger-1">
        <StatTile value={seated}       label="Guests Seated"    icon={Users}       accent="#c9a84c" />
        <StatTile value={wCount}       label="In Queue"         icon={Clock}       accent="#d4782a" />
        <StatTile value={free_tables}  label="Free Tables"      icon={Table2}      accent="#4a7c5f" />
        <StatTile value={total_tables} label="Total Tables"     icon={TrendingUp}  accent="#6aab84" />
        <StatTile value={completed}    label="Served Today"     icon={CheckCircle} accent="#9ab0f0" />
        <StatTile value={`${avg_wait_min}m`} label="Avg Wait"  icon={AlertCircle} accent="#e87a5a" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:8 }}>

        {/* Mini queue */}
        <div className="card animate-in stagger-2">
          <div className="card-title">Current Queue</div>
          {waiting.length === 0 ? (
            <div style={{ color:'rgba(245,239,227,0.35)', fontStyle:'italic', fontSize:'0.95rem' }}>
              No one waiting right now ✦
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Guest</th><th>Size</th><th>Wait</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ color:'var(--gold)', fontFamily:'DM Mono', fontSize:'0.8rem' }}>#{b.queue_position}</span></td>
                    <td>{b.customer_name}</td>
                    <td><span className="mono">{b.group_size} pax</span></td>
                    <td><span className="badge badge-waiting">~{b.estimated_wait}m</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mini table map */}
        <div className="card animate-in stagger-3">
          <div className="card-title">Table Overview</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
            {tables.map(t => (
              <div key={t.id} style={{
                padding:'10px 8px',
                borderRadius:4,
                border: `1px solid ${t.status === 'free' ? 'rgba(74,124,95,0.4)' : 'rgba(184,76,42,0.4)'}`,
                background: t.status === 'free' ? 'rgba(74,124,95,0.08)' : 'rgba(184,76,42,0.08)',
                textAlign:'center',
              }}>
                <div style={{
                  fontFamily:'Playfair Display',
                  fontWeight:700,
                  fontSize:'1rem',
                  color: t.status === 'free' ? 'var(--sage-light)' : '#e87a5a'
                }}>
                  {t.name}
                </div>
                <div style={{
                  fontFamily:'DM Mono',
                  fontSize:'0.58rem',
                  color:'rgba(245,239,227,0.4)',
                  letterSpacing:'0.1em',
                  marginTop:2
                }}>
                  {t.capacity}p
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}