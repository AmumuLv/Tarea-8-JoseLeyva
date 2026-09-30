import useAuthStore from '../store/authStore'

const usePermission = () => {
  const { hasPermission, user } = useAuthStore()
  const isAdmin = user?.rol?.nombre === 'Administrador' || user?.rol_id === 1
  return { hasPermission, user, isAdmin }
}

export default usePermission
