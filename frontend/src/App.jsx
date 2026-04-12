import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Placements from './pages/admin/Placements'
import Reports from './pages/admin/Reports'

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* PROTECTED LAYOUT WRAPPER */}
        <Route
          element={
            <ProtectedRoute>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1, padding: '24px', background: '#f0f2f5' }}>
                  {/* 👇 This is key: render outlet */}
                </main>
                <Footer />
              </div>
            </ProtectedRoute>
          }
        >

          {/* CHILD ROUTES */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/reports" element={<Reports />} />

        </Route>

        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  )
}

export default App