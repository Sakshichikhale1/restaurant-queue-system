import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar    from './components/Sidebar'
import Dashboard  from './pages/Dashboard'
import NewBooking from './pages/NewBooking'
import Queue      from './pages/Queue'
import Tables     from './pages/Tables'
import AdminPanel from './pages/AdminPanel'
import SmsLog     from './pages/SmsLog'

const PAGES = {
  dashboard: Dashboard,
  booking:   NewBooking,
  queue:     Queue,
  tables:    Tables,
  admin:     AdminPanel,
  sms:       SmsLog,
}

export default function App() {
  const [active, setActive] = useState('dashboard')

  const Page = PAGES[active] || Dashboard

  return (
    <>
      <div className="app-shell">
        <Sidebar active={active} setActive={setActive} />
        <main className="main-content">
          <Page />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1c1207',
            color: '#f5efe3',
            border: '1px solid rgba(201,168,76,0.3)',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '0.98rem',
          }
        }}
      />
    </>
  )
}