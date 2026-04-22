import {
  BrowserRouter as Router,
  Routes, Route, Navigate,
} from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import { ROLE_HOME, ADMIN_ROLES } from './constants'

// ── Guards ────────────────────────────────────────────
import ProtectedRoute from './components/ProtectedRoute'

// ── Shared layout components ──────────────────────────
import Navbar  from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer  from './components/Footer'

// ── Public / Guest pages ──────────────────────────────
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// ── Admin & Academic Supervisor pages ─────────────────
import AdminDashboard    from './pages/admin/Dashboard'
import AcademicDashboard from './pages/AcademicDashboard'
import Students          from './pages/admin/Students'
import Placements        from './pages/admin/Placements'
import Evaluations       from './pages/admin/Evaluations'
import Reports           from './pages/admin/Reports'
import UserAccounts      from './pages/admin/UserAccounts'

// ─────────────────────────────────────────────────────
// PUBLIC LAYOUT  (Login / Register)
// Minimal Navbar → content → Footer
// ─────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar minimal />
      <Box flex={1}>{children}</Box>
      <Footer minimal />
    </Flex>
  )
}

function AdminLayout({ children }) {
  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Flex direction="column" flex={1} minW={0} overflowX="hidden">
        <Navbar />
        <Box flex={1} overflowY="auto" p={6} bg="gray.50">
          <Box maxW="1200px" w="100%">
            {children}
          </Box>
        </Box>
        <Footer />
      </Flex>
    </Flex>
  )
}

// ─────────────────────────────────────────────────────
// ROOT REDIRECT
// / → Home page if not logged in
// / → role home if logged in
// ─────────────────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/home" replace />
  const home = ROLE_HOME[user.role] || '/login'
  return <Navigate to={home} replace />
}

// ─────────────────────────────────────────────────────
// DASHBOARD REDIRECT
// /dashboard → correct dashboard based on role
// ─────────────────────────────────────────────────────
function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'academic_supervisor') {
    return (
      <ProtectedRoute allowedRoles={ADMIN_ROLES}>
        <AdminLayout><AcademicDashboard /></AdminLayout>
      </ProtectedRoute>
    )
  }

  // internship_administrator / admin
  return (
    <ProtectedRoute allowedRoles={ADMIN_ROLES}>
      <AdminLayout><AdminDashboard /></AdminLayout>
    </ProtectedRoute>
  )
}

// ─────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────
function App() {
  const { user } = useAuth()

  // Redirect already-logged-in users away from public pages
  const publicRedirect = user
    ? <Navigate to={ROLE_HOME[user.role] || '/dashboard'} replace />
    : null

  return (
    <Router>
      <Routes>

        {/* ── Root → Home or role dashboard ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Home / landing page for guests ── */}
        <Route
          path="/home"
          element={publicRedirect ?? <Home />}
        />

        {/* ── Login ── */}
        <Route
          path="/login"
          element={
            publicRedirect ?? (
              <PublicLayout><Login /></PublicLayout>
            )
          }
        />

        {/* ── Register ── */}
        <Route
          path="/register"
          element={
            publicRedirect ?? (
              <PublicLayout><Register /></PublicLayout>
            )
          }
        />

        {/* ── Dashboard — routes to correct one by role ── */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* ── Internship Administrator only ── */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout><Students /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/placements"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout><Placements /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout><UserAccounts /></AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Both Admin + Academic Supervisor ── */}
        <Route
          path="/evaluations"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout><Evaluations /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout><Reports /></AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App