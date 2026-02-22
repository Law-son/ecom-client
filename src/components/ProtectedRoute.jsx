import { Navigate, Outlet } from 'react-router-dom'
import useSessionStore from '../store/sessionStore'

function ProtectedRoute({ allowedRoles }) {
  const { role, isTokenExpired } = useSessionStore()

  if (!role || isTokenExpired()) {
    return <Navigate to="/login" replace />
  }

  const normalizedRole = role.toString().toLowerCase()
  const normalizedAllowedRoles = allowedRoles?.map((r) => r.toLowerCase())

  // Map STAFF to admin for UI purposes
  const effectiveRole = normalizedRole === 'staff' ? 'admin' : normalizedRole

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(effectiveRole)) {
    return <Navigate to="/catalog" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

