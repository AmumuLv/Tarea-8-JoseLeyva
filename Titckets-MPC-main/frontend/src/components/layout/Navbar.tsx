import { LogOut, Menu } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useUIStore from '../../store/uiStore'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useUIStore()

  const getDisplayName = () => {
    if (user?.areaInstitucional) {
      return user.areaInstitucional.nombre
    }
    return `${user?.nombres || ''} ${user?.apellidos || ''}`
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{getDisplayName()}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
