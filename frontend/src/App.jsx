import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'

import Dashboard from './components/student_intern/Dashboard'
import Logbook from './components/student_intern/Logbook'
import MyEvaluations from './components/student_intern/MyEvaluations'
import MyPlacement from './components/student_intern/MyPlacement'
import MyProfile from './components/student_intern/MyProfile'

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return <div>Please log in</div>
  }

  return (
    <BrowserRouter>
      <div className="app-container">

        <nav className="sidebar">
          <div className="nav-header">
            <h2>ILES Portal</h2>
          </div>

          <ul className="nav-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/logbook">Logbook</Link></li>
            <li><Link to="/evaluations">My Evaluations</Link></li>
            <li><Link to="/placement">My Placement</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logbook" element={<Logbook />} />
            <Route path="/evaluations" element={<MyEvaluations />} />
            <Route path="/placement" element={<MyPlacement />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App