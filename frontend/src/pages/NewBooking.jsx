import React, { useState } from 'react'
import { Utensils, Phone, Users, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'   // ✅ fixed import
import { createBooking } from '../utils/api'

export default function NewBooking() {
  const [form, setForm] = useState({ customer_name: '', phone: '', group_size: 2 })
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.customer_name.trim() || !form.phone.trim()) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const { data } = await createBooking({
        ...form,
        group_size: Number(form.group_size)
      })

      setResult(data)
      setForm({ customer_name: '', phone: '', group_size: 2 })

      // ✅ improved toast
      toast.success(`🍽️ ${data.message}`)

    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error creating booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">New Booking</h1>
        <div className="page-subtitle">Auto-assigns best-fit table or queues the party</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'480px 1fr', gap:28, alignItems:'start' }}>

        {/* Form */}
        <div className="card animate-in">
          <div className="card-title">Guest Details</div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Guest Name</label>
              <div style={{ position:'relative' }}>
                <input
                  className="form-input"
                  placeholder="e.g. Priya Sharma"
                  value={form.customer_name}
                  onChange={e => set('customer_name', e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
                <Utensils size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gold)', opacity:0.6 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position:'relative' }}>
                <input
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
                <Phone size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gold)', opacity:0.6 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Party Size</label>
              <div style={{ position:'relative' }}>
                <select
                  className="form-input"
                  value={form.group_size}
                  onChange={e => set('group_size', Number(e.target.value))}
                  style={{ paddingLeft: 40 }}
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n===1?'person':'people'}</option>
                  ))}
                </select>
                <Users size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gold)', opacity:0.6 }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop:4, justifyContent:'center', padding:'12px 20px', fontSize:'1.05rem' }}
            >
              {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}} /> Checking…</> : 'Check & Book'}
            </button>
          </form>
        </div>

        {/* Result card */}
        {result && (
          <div className="card animate-in" style={{
            border: `1px solid ${result.status === 'seated' ? 'rgba(74,124,95,0.5)' : 'rgba(212,120,42,0.5)'}`,
            background: result.status === 'seated' ? 'rgba(74,124,95,0.07)' : 'rgba(212,120,42,0.07)'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              {result.status === 'seated'
                ? <CheckCircle size={28} color="var(--sage-light)" />
                : <Clock size={28} color="#e89550" />
              }
              <div>
                <div style={{
                  fontFamily:'Playfair Display', fontSize:'1.35rem', fontWeight:700, fontStyle:'italic',
                  color: result.status === 'seated' ? 'var(--sage-light)' : '#e89550'
                }}>
                  {result.status === 'seated' ? 'Table Assigned!' : 'Added to Queue'}
                </div>
                <div style={{ fontSize:'0.9rem', color:'rgba(245,239,227,0.55)', marginTop:2 }}>
                  {result.message}
                </div>
              </div>
            </div>

            {result.status === 'seated' && result.table && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <InfoBox label="Table" value={result.table.name} />
                <InfoBox label="Capacity" value={`${result.table.capacity} seats`} />
                <InfoBox label="Booking ID" value={`#${result.booking_id}`} />
                <InfoBox label="Status" value="Seated ✓" />
              </div>
            )}

            {result.status === 'waiting' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <InfoBox label="Queue Position" value={`#${result.queue_position}`} />
                <InfoBox label="Est. Wait" value={`~${result.estimated_wait} min`} />
                <InfoBox label="Booking ID" value={`#${result.booking_id}`} />
              </div>
            )}

            <div className="sms-preview">
              <div className="sms-preview-label">📱 SMS Preview</div>
              {result.sms_preview}
            </div>
          </div>
        )}

        {!result && (
          <div className="card animate-in" style={{ background:'rgba(255,255,255,0.015)', border:'1px dashed rgba(201,168,76,0.15)' }}>
            <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(245,239,227,0.25)' }}>
              <Utensils size={36} style={{ marginBottom:12, opacity:0.3 }} />
              <div style={{ fontStyle:'italic', fontSize:'1rem' }}>
                Fill the form to auto-assign a table or join the queue
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.04)', borderRadius:4, padding:'10px 14px',
      border:'1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ fontFamily:'DM Mono', fontSize:'0.6rem', color:'rgba(201,168,76,0.6)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontFamily:'Playfair Display', fontSize:'1.1rem', fontWeight:700, marginTop:3 }}>{value}</div>
    </div>
  )
}