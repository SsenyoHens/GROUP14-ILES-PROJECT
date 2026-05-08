import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'

import Dashboard from "./pages/student_intern/Dashboard";
import Logbook from "./pages/student_intern/Logbook";
import MyEvaluation from "./pages/student_intern/MyEvaluation";
import MyPlacement from "./pages/student_intern/MyPlacement";
import MyProfile from "./pages/student_intern/MyProfile";

import './App.css'

function App() {
  const [isLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return <div>Please log in</div>
  }

  return (
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
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/logbook" element={<Logbook />} />
          <Route path="/student/evaluations" element={<MyEvaluation />} />
          <Route path="/student/placement" element={<MyPlacement />} />
          <Route path="/student/profile" element={<MyProfile />} />
        </Routes>
      </main>

    </div>
  )
}

export default App