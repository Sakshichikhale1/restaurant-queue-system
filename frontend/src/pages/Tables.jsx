import React, { useEffect, useState, useCallback } from 'react'
import { Users, Unlock, Coffee } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTables, freeTable } from '../utils/api'
import { useRealtime } from '../hooks/useRealtime'

const TABLE_ICONS = {
  2: '⬡',
  4: '⬛',
  6: '⬜',
  8: '⬛',
}

export default function Tables() {
  const [tables,  setTables]  = useState([])
  const [loading, setLoading] = useState(true)
  const [freeing, setFreeing] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await getTables()
      setTables(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useRealtime(load)
  useEffect(() => { load() }, [load])

  const handleFree = async (table) => {
    if (table.status === 'free') return
    const ok = window.confirm(`Free table ${table.name}? This will mark the booking as completed.`)
    if (!ok) return
    setFreeing(table.id)
    try {
      const { data } = await freeTable(table.id)
      toast.success(
        data.auto_assigned
          ? `Table ${table.name} freed — next party auto-assigned!`
          : `Table ${table.name} is now free.`,
        { className:'toast-custom' }
      )
      load()
    } catch {
      toast.error('Error freeing table', { className:'toast-custom' })
    } finally {
      setFreeing(null)
    }
  }

  const occupied = tables.filter(t => t.status === 'occupied').length
  const free     = tables.filter(t => t.status === 'free').length

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Tables</h1>
        <div className="page-subtitle">Click an occupied table to free it</div>
      </div>

      {/* Quick stats */}
      <div style={{ display:'flex', gap:12, marginBottom:32 }}>
        <div className="badge badge-seated" style={{ padding:'6px 14px', fontSize:'0.75rem' }}>
          <Coffee size={12} /> {free} Free
        </div>
        <div className="badge badge-occupied" style={{ padding:'6px 14px', fontSize:'0.75rem' }}>
          <Users size={12} /> {occupied} Occupied
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{width:32,height:32}} /></div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
          gap:16
        }}>
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onFree={handleFree}
              freeing={freeing === table.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TableCard({ table, onFree, freeing }) {
  const isFree = table.status === 'free'

  return (
    <div
      onClick={() => !isFree && onFree(table)}
      style={{
        background: isFree
          ? 'rgba(74,124,95,0.07)'
          : 'rgba(184,76,42,0.09)',
        border: `1px solid ${isFree ? 'rgba(74,124,95,0.35)' : 'rgba(184,76,42,0.45)'}`,
        borderRadius: 10,
        padding: '22px 20px',
        cursor: isFree ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="animate-in"
      onMouseEnter={e => { if (!isFree) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Corner accent */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:3,
        background: isFree ? 'rgba(74,124,95,0.7)' : 'rgba(184,76,42,0.7)'
      }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{
            fontFamily:'Playfair Display', fontWeight:900,
            fontSize:'1.8rem', lineHeight:1,
            color: isFree ? 'var(--sage-light)' : '#e87a5a'
          }}>
            {table.name}
          </div>
          <div style={{
            fontFamily:'DM Mono', fontSize:'0.62rem',
            color:'rgba(245,239,227,0.4)', letterSpacing:'0.1em',
            marginTop:4
          }}>
            {table.capacity} SEATS
          </div>
        </div>

        <div>
          <span className={`badge ${isFree ? 'badge-free' : 'badge-occupied'}`}>
            {isFree ? 'Free' : 'Occupied'}
          </span>
        </div>
      </div>

      {!isFree && (
        <div style={{
          marginTop:16, paddingTop:14,
          borderTop:'1px solid rgba(255,255,255,0.07)'
        }}>
          <div style={{ fontWeight:600, fontSize:'1.02rem', color:'var(--parchment)' }}>
            {table.customer_name}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4, color:'rgba(245,239,227,0.5)', fontSize:'0.88rem' }}>
            <Users size={12} /> {table.group_size} guests
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:5, color:'rgba(245,239,227,0.4)', fontFamily:'DM Mono', fontSize:'0.62rem', letterSpacing:'0.08em' }}>
            <Unlock size={11} /> CLICK TO FREE TABLE
          </div>
        </div>
      )}

      {isFree && (
        <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color:'rgba(245,239,227,0.25)', fontStyle:'italic', fontSize:'0.88rem' }}>
            Available
          </div>
        </div>
      )}

      {freeing && (
        <div style={{
          position:'absolute', inset:0,
          background:'rgba(10,5,2,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius:10
        }}>
          <div className="spinner" />
        </div>
      )}
    </div>
  )
}