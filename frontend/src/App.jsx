import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Flex } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard    from './pages/admin/Dashboard'
//import Students     from './pages/admin/Students'
//import Placements   from './pages/admin/Placements'
//import Evaluations  from './pages/admin/Evaluations'
//import Reports      from './pages/admin/Reports'
//import UserAccounts from './pages/admin/UserAccounts'

function AdminLayout({ children }) {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Flex flex={1} direction="column" bg="gray.50" overflowY="auto">
        <Flex flex={1} p={6} direction="column" maxW="1200px" w="100%">
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/students"     element={<Students />} />
                <Route path="/students/:id" element={<Students />} />
                <Route path="/placements"   element={<Placements />} />
                <Route path="/evaluations"  element={<Evaluations />} />
                <Route path="/reports"      element={<Reports />} />
                <Route path="/users"        element={<UserAccounts />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App