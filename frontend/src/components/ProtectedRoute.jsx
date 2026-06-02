import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  // Still loading auth state — show nothing
  if (loading) return null

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Logged in but wrong role → go to their home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleHome = {
      admin:               '/admin/dashboard',
      academic_supervisor: '/academic/dashboard',
      student:             '/student/dashboard',
      workplace_supervisor:'/workplace/dashboard',
    }
    return <Navigate to={roleHome[user.role] || '/login'} replace />
  }

  return children
}

export default ProtectedRoute