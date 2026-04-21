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

// ── Public pages ──────────────────────────────────────
import Login     from './pages/Login'
import Register  from './pages/Register'
import NotFound  from './pages/NotFound'

// ── Admin pages ───────────────────────────────────────
import Dashboard    from './pages/admin/Dashboard'
import Students     from './pages/admin/Students'
import Placements   from './pages/admin/Placements'
import Evaluations  from './pages/admin/Evaluations'
import Reports      from './pages/admin/Reports'
import UserAccounts from './pages/admin/UserAccounts'

// ─────────────────────────────────────────────────────
// PUBLIC LAYOUT
// Navbar (minimal) → page content → Footer
// Used by: Login, Register
// ─────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar minimal />
      <Box flex={1}>
        {children}
      </Box>
      <Footer minimal />
    </Flex>
  )
}

// ─────────────────────────────────────────────────────
// ADMIN LAYOUT
// ┌──────────┬───────────────────────────┐
// │          │  Navbar (breadcrumb)      │
// │ Sidebar  ├───────────────────────────┤
// │          │  Page content             │
// │          ├───────────────────────────┤
// │          │  Footer                   │
// └──────────┴───────────────────────────┘
// ─────────────────────────────────────────────────────
function AdminLayout({ children }) {
  return (
    <Flex minH="100vh" bg="gray.50">

      {/* Left sidebar — fixed height, sticky */}
      <Sidebar />

      {/* Right side — navbar + scrollable content + footer */}
      <Flex
        direction="column"
        flex={1}
        minW={0}         /* prevents flex child overflow */
        overflowX="hidden"
      >
        {/* Top navbar with breadcrumb */}
        <Navbar />

        {/* Scrollable page area */}
        <Box
          flex={1}
          overflowY="auto"
          p={6}
          bg="gray.50"
        >
          <Box maxW="1200px" w="100%">
            {children}
          </Box>
        </Box>

        {/* Footer pinned to bottom of content area */}
        <Footer />
      </Flex>

    </Flex>
  )
}

// ─────────────────────────────────────────────────────
// ROOT REDIRECT
// Sends logged-in users to their role's home page
// ─────────────────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const home = ROLE_HOME[user.role] || '/login'
  return <Navigate to={home} replace />
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

        {/* ── Root ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public pages (Login / Register) ──
            If already logged in → redirect to their dashboard
            If not logged in → show page wrapped in PublicLayout  */}
        <Route
          path="/login"
          element={
            publicRedirect ?? (
              <PublicLayout>
                <Login />
              </PublicLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            publicRedirect ?? (
              <PublicLayout>
                <Register />
              </PublicLayout>
            )
          }
        />

        {/* ── Admin / Academic Supervisor routes ──
            ProtectedRoute blocks non-admins and shows AccessDenied  */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout><Students /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/placements"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout><Placements /></AdminLayout>
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout><UserAccounts /></AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ── 404 — catch everything else ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App