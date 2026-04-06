import React from 'react'
import {
  LayoutDashboard, Users, Table2, ClipboardList,
  MessageSquare, Utensils
} from 'lucide-react'
import { useRealtime } from '../hooks/useRealtime'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'booking',   label: 'New Booking',  icon: Utensils },
  { id: 'queue',     label: 'Queue',        icon: Users },
  { id: 'tables',    label: 'Tables',       icon: Table2 },
  { id: 'admin',     label: 'Admin Panel',  icon: ClipboardList },
  { id: 'sms',       label: 'SMS Log',      icon: MessageSquare },
]

export default function Sidebar({ active, setActive }) {
  const { connected } = useRealtime()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">Vaishali</div>
        <div className="tagline">Queue Manager</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? 'active' : ''}`}
            onClick={() => setActive(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="live-dot">
          <span className={connected ? 'pulse-dot' : 'pulse-dot'} style={!connected ? { background: '#e87a5a' } : {}} />
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>
    </aside>
  )
}