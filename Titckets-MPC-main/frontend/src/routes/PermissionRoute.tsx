import { Navigate, Outlet } from 'react-router-dom'
import usePermission from '../hooks/usePermission'
import useAuthStore from '../store/authStore'

interface PermissionRouteProps {
  permission: string
}

export default function PermissionRoute({ permission }: PermissionRouteProps) {
  const { hasPermission } = usePermission()
  const isLoading = useAuthStore(s => s.isLoading)

  if (isLoading) return null

  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
