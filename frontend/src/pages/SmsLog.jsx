import React, { useEffect, useState, useCallback } from 'react'
import { MessageSquare, RefreshCw } from 'lucide-react'
import { getSmsLog } from '../utils/api'
import { useRealtime } from '../hooks/useRealtime'

export default function SmsLog() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await getSmsLog()
      setLogs(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useRealtime(load)
  useEffect(() => { load() }, [load])

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">SMS Log</h1>
          <div className="page-subtitle">Last 50 messages sent</div>
        </div>
        <button className="btn btn-ghost" onClick={() => { setLoading(true); load() }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{width:32,height:32}} /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} />
          <p>No SMS sent yet</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {logs.map(log => (
            <div key={log.id} className="card animate-in" style={{ padding:'16px 20px', display:'flex', gap:16 }}>
              <div style={{
                width:36, height:36, borderRadius:'50%', flexShrink:0,
                background:'rgba(74,124,95,0.15)', border:'1px solid rgba(74,124,95,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <MessageSquare size={15} color="var(--sage-light)" />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ fontWeight:600 }}>{log.customer_name}</div>
                  <span className="mono" style={{ fontSize:'0.65rem', color:'rgba(245,239,227,0.35)' }}>
                    {log.sent_at?.slice(0,16)}
                  </span>
                </div>
                <div style={{ fontFamily:'DM Mono', fontSize:'0.75rem', color:'rgba(245,239,227,0.5)', marginBottom:4 }}>
                  → {log.phone}
                </div>
                <div style={{
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:4, padding:'8px 12px',
                  fontFamily:'DM Mono', fontSize:'0.78rem', lineHeight:1.5,
                  color:'rgba(245,239,227,0.75)'
                }}>
                  {log.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}