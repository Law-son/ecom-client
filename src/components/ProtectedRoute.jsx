import { Navigate, Outlet } from 'react-router-dom'
import useSessionStore from '../store/sessionStore'

function ProtectedRoute({ allowedRoles }) {
  const { role } = useSessionStore()

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/catalog" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

