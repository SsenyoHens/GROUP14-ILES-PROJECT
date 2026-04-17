import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Placements from './pages/admin/Placements'
import Evaluations from './pages/admin/Evaluations'
import Reports from './pages/admin/Reports'
import UserAccounts from './pages/admin/UserAccounts'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UserAccounts />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App