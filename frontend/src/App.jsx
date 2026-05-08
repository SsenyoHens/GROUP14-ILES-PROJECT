import {
  BrowserRouter as Router,
  Routes, Route, Navigate,
} from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import {
  ROLES, ADMIN_ROLES, ROLE_HOME, ROUTES,
} from './constants'

// ── Guards ────────────────────────────────────────────────────────
import ProtectedRoute from './components/ProtectedRoute'

// ── Layout components ─────────────────────────────────────────────
import Navbar            from './components/Navbar'
import Sidebar           from './components/Sidebar'            // admin
import StudentSidebar    from './components/StudentSidebar'     // student
import WorkplaceSupervisorSidebar from './components/WorkplaceSupervisorSidebar'  // workplace supervisor
import Footer            from './components/Footer'

// ── Public pages ──────────────────────────────────────────────────
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// ── Admin pages ───────────────────────────────────────────────────
import AdminDashboard    from './pages/admin/Dashboard'
import Students          from './pages/admin/Students'
import Placements        from './pages/admin/Placements'
import Evaluations       from './pages/admin/Evaluations'
import Reports           from './pages/admin/Reports'
import UserAccounts      from './pages/admin/UserAccounts'

// ── Academic Supervisor (shares AdminLayout + some admin pages) ───
import AcademicDashboard from './pages/AcademicDashboard'

// ── Student portal pages ──────────────────────────────────────────
import StudentDashboard from './pages/student_intern/Dashboard'
import MyPlacement      from './pages/student_intern/MyPlacement'
import MyEvaluations    from './pages/student_intern/MyEvaluation'
import Logbook          from './pages/student_intern/Logbook'
import StudentProfile   from './pages/student_intern/MyProfile'

// ── Workplace Supervisor portal pages ─────────────────────────────
import WorkplaceSupervisorDashboard from './pages/workplace_supervisor/Dashboard'
import MyStudents          from './pages/workplace_supervisor/MyStudents'
import SubmitEvaluation    from './pages/workplace_supervisor/SubmitEvaluation'
import AttendanceLog       from './pages/workplace_supervisor/AttendanceLog'
import WorkplaceSupervisorProfile   from './pages/workplace_supervisor/MyProfile'

// ─────────────────────────────────────────────────────────────────
// LAYOUTS
// ─────────────────────────────────────────────────────────────────

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
          <Box maxW="1200px" w="100%">{children}</Box>
        </Box>
        <Footer />
      </Flex>
    </Flex>
  )
}

function StudentLayout({ children }) {
  return (
    <Flex minH="100vh" bg="gray.50">
      <StudentSidebar />
      <Flex direction="column" flex={1} minW={0} overflowX="hidden">
        <Navbar />
        <Box flex={1} overflowY="auto" p={6} bg="gray.50">
          <Box maxW="1200px" w="100%">{children}</Box>
        </Box>
        <Footer />
      </Flex>
    </Flex>
  )
}

function WorkplaceSupervisorLayout({ children }) {
  return (
    <Flex minH="100vh" bg="gray.50">
      <WorkplaceSupervisorSidebar />
      <Flex direction="column" flex={1} minW={0} overflowX="hidden">
        <Navbar />
        <Box flex={1} overflowY="auto" p={6} bg="gray.50">
          <Box maxW="1200px" w="100%">{children}</Box>
        </Box>
        <Footer />
      </Flex>
    </Flex>
  )
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/** Wraps a page in ProtectedRoute + its layout in one expression */
function Protected({ roles, layout: Layout, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

// ─────────────────────────────────────────────────────────────────
// ROOT REDIRECT  →  /  sends each role to their home route
// ─────────────────────────────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.HOME} replace />
  return <Navigate to={ROLE_HOME[user.role] || ROUTES.LOGIN} replace />
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD REDIRECT  →  /dashboard resolves to correct portal
// ─────────────────────────────────────────────────────────────────
function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  switch (user.role) {
    case ROLES.STUDENT:
      return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />

    case ROLES.WORKPLACE_SUPERVISOR:
      return <Navigate to={ROUTES.WORKPLACESUPERVISOR_DASHBOARD} replace />

    case ROLES.ACADEMIC_SUPERVISOR:
      return (
        <Protected roles={ADMIN_ROLES} layout={AdminLayout}>
          <AcademicDashboard />
        </Protected>
      )

    default: // ROLES.ADMIN / 'internship_administrator'
      return (
        <Protected roles={ADMIN_ROLES} layout={AdminLayout}>
          <AdminDashboard />
        </Protected>
      )
  }
}

// ─────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────
function App() {
  const { user } = useAuth()

  // Already-logged-in users are bounced away from public pages
  const publicRedirect = user
    ? <Navigate to={ROLE_HOME[user.role] || ROUTES.DASHBOARD} replace />
    : null

  return (
    <Router>
      <Routes>

        {/* ── Root ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public (guest-only) pages ── */}
        <Route path={ROUTES.HOME}
          element={publicRedirect ?? <Home />}
        />
        <Route path={ROUTES.LOGIN}
          element={publicRedirect ?? <PublicLayout><Login /></PublicLayout>}
        />
        <Route path={ROUTES.REGISTER}
          element={publicRedirect ?? <PublicLayout><Register /></PublicLayout>}
        />

        {/* ── Universal /dashboard → role-correct portal ── */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardRedirect />} />

        {/* ─────────────────────────────────────────────────────
            INTERNSHIP ADMINISTRATOR  (role: 'admin')
        ───────────────────────────────────────────────────── */}
        <Route path={ROUTES.STUDENTS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <Students />
            </Protected>
          }
        />
        <Route path={ROUTES.PLACEMENTS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <Placements />
            </Protected>
          }
        />
        <Route path={ROUTES.USERS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <UserAccounts />
            </Protected>
          }
        />

        {/* ─────────────────────────────────────────────────────
            ADMIN + ACADEMIC SUPERVISOR  (shared pages)
        ───────────────────────────────────────────────────── */}
        <Route path={ROUTES.EVALUATIONS}
          element={
            <Protected roles={ADMIN_ROLES} layout={AdminLayout}>
              <Evaluations />
            </Protected>
          }
        />
        <Route path={ROUTES.REPORTS}
          element={
            <Protected roles={ADMIN_ROLES} layout={AdminLayout}>
              <Reports />
            </Protected>
          }
        />

        {/* ─────────────────────────────────────────────────────
            STUDENT PORTAL  (/student/*)
        ───────────────────────────────────────────────────── */}
        <Route path={ROUTES.STUDENT_DASHBOARD}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <StudentDashboard />
            </Protected>
          }
        />
        <Route path={ROUTES.STUDENT_PLACEMENT}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <MyPlacement />
            </Protected>
          }
        />
        <Route path={ROUTES.STUDENT_EVALUATIONS}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <MyEvaluations />
            </Protected>
          }
        />
        <Route path={ROUTES.STUDENT_LOGBOOK}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <Logbook />
            </Protected>
          }
        />
        <Route path={ROUTES.STUDENT_PROFILE}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <StudentProfile />
            </Protected>
          }
        />

        {/* ─────────────────────────────────────────────────────
            WORKPLACE SUPERVISOR PORTAL  (/workplace-supervisor/*)
        ───────────────────────────────────────────────────── */}
        <Route path={ROUTES.WORKPLACEWORKPLACESUPERVISOR_DASHBOARD}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceSupervisorLayout}>
              <WorkplaceSupervisorDashboard />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACEWORKPLACESUPERVISOR_STUDENTS}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceSupervisorLayout}>
              <MyStudents />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACEWORKPLACESUPERVISOR_EVALUATIONS}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceSupervisorLayout}>
              <SubmitEvaluation />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACEWORKPLACESUPERVISOR_ATTENDANCE}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceSupervisorLayout}>
              <AttendanceLog />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACEWORKPLACESUPERVISOR_PROFILE}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceSupervisorLayout}>
              <WorkplaceSupervisorProfile />
            </Protected>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App