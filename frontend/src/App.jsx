import {
  BrowserRouter as Router,
  Routes, Route, Navigate,
} from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import NotificationsPage from './pages/NotificationsPage'
import { ROUTES, ROLES, ROLE_HOME } from './constants/index'

// Guards 
import ProtectedRoute from './components/ProtectedRoute'

// Layout components 
import Navbar                     from './components/Navbar'
import Sidebar                    from './components/Sidebar'
import StudentSidebar             from './components/studentsidebar'
import WorkplaceSupervisorSidebar from './components/workplacesupervisorsidebar'
import AcademicSupervisorSidebar  from './components/AcademicSupervisorSidebar'
import Footer                     from './components/Footer'

// Public pages 
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Admin (Internship Administrator) pages 
import AdminDashboard from './pages/admin/Dashboard'
import Students       from './pages/admin/Students'
import Placements     from './pages/admin/Placements'
import Evaluations    from './pages/admin/Evaluations'
import Reports        from './pages/admin/Reports'
import UserAccounts   from './pages/admin/UserAccounts'

// Academic Supervisor unique pages
import AcademicDashboard    from './pages/Academic_supervisor/Dashboard'
import AcademicStudents     from './pages/Academic_supervisor/Students'
import AcademicEvaluations  from './pages/Academic_supervisor/Evaluations'
import AcademicReports      from './pages/Academic_supervisor/Reports'
import AcademicMyProfile    from './pages/Academic_supervisor/MyProfile'

// Student-intern portal pages
import StudentDashboard from './pages/student_intern/Dashboard'
import MyPlacement      from './pages/student_intern/MyPlacement'
import MyEvaluations    from './pages/student_intern/MyEvaluation'
import Logbook          from './pages/student_intern/Logbook'
import StudentProfile   from './pages/student_intern/MyProfile'

// Workplace Supervisor portal pages 
import WorkplaceSupervisorDashboard from './pages/workplace_supervisor/Dashboard'
import MyStudents                   from './pages/workplace_supervisor/MyStudents'
import SubmitEvaluation             from './pages/workplace_supervisor/SubmitEvaluation'
import AttendanceLog                from './pages/workplace_supervisor/AttendanceLog'
import WorkplaceSupervisorProfile   from './pages/workplace_supervisor/MyProfile'

// Layout Wrappers
function PublicLayout({ children }) {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
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

function AcademicLayout({ children }) {
  return (
    <Flex minH="100vh" bg="gray.50">
      <AcademicSupervisorSidebar />
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

function WorkplaceLayout({ children }) {
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

function Protected({ roles, layout: Layout, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return <Navigate to={ROLE_HOME[user.role] || ROUTES.LOGIN} replace />
}

function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return <Navigate to={ROLE_HOME[user.role] || ROUTES.LOGIN} replace />
}

function App() {
  const { user } = useAuth()

  const publicRedirect = user
    ? <Navigate to={ROLE_HOME[user.role] || ROUTES.DASHBOARD} replace />
    : null

  return (
    <Router>
      <Routes>
        {/* ── Root ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public pages ── */}
        <Route path={ROUTES.HOME} element={publicRedirect ?? <Home />} />
        <Route path={ROUTES.LOGIN} element={publicRedirect ?? <PublicLayout><Login /></PublicLayout>} />
        <Route path={ROUTES.REGISTER} element={publicRedirect ?? <PublicLayout><Register /></PublicLayout>} />

        {/* ── Universal dashboard redirect ── */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardRedirect />} />

        {/* ── ADMIN — Internship Administrator ── */}
        <Route path={ROUTES.ADMIN_DASHBOARD}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <AdminDashboard />
            </Protected>
          }
        />
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
        <Route path={ROUTES.EVALUATIONS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <Evaluations />
            </Protected>
          }
        />
        <Route path={ROUTES.REPORTS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <Reports />
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
        <Route path={ROUTES.ADMIN_NOTIFICATIONS}
          element={
            <Protected roles={[ROLES.ADMIN]} layout={AdminLayout}>
              <NotificationsPage />
            </Protected>
          } 
        />

        {/* ── ACADEMIC SUPERVISOR ── */}
        <Route path={ROUTES.ACADEMIC_DASHBOARD}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <AcademicDashboard />
            </Protected>
          }
        />
        <Route path={ROUTES.ACADEMIC_STUDENTS}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <AcademicStudents />
            </Protected>
          }
        />
        <Route path={ROUTES.ACADEMIC_EVALUATIONS}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <AcademicEvaluations />
            </Protected>
          }
        />
        <Route path={ROUTES.ACADEMIC_REPORTS}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <AcademicReports />
            </Protected>
          }
        />
        <Route path={ROUTES.ACADEMIC_NOTIFICATIONS}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <NotificationsPage />
            </Protected>
          } 
        />
        <Route path={ROUTES.ACADEMIC_PROFILE}
          element={
            <Protected roles={[ROLES.ACADEMIC_SUPERVISOR]} layout={AcademicLayout}>
              <AcademicMyProfile />
            </Protected>
          }
        />
        
        {/* ── STUDENT PORTAL ── */}
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
        <Route path={ROUTES.STUDENT_NOTIFICATIONS}
          element={
            <Protected roles={[ROLES.STUDENT]} layout={StudentLayout}>
              <NotificationsPage />
            </Protected>
          } 
        />

        {/* ── WORKPLACE SUPERVISOR PORTAL ── */}
        <Route path={ROUTES.WORKPLACE_DASHBOARD}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <WorkplaceSupervisorDashboard />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACE_STUDENTS}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <MyStudents />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACE_EVALUATIONS}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <SubmitEvaluation />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACE_ATTENDANCE}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <AttendanceLog />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACE_PROFILE}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <WorkplaceSupervisorProfile />
            </Protected>
          }
        />
        <Route path={ROUTES.WORKPLACE_NOTIFICATIONS}
          element={
            <Protected roles={[ROLES.WORKPLACE_SUPERVISOR]} layout={WorkplaceLayout}>
              <NotificationsPage />
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