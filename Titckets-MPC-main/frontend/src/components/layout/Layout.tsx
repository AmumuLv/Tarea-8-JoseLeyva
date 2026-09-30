import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useAuth from '../../hooks/useAuth'
import Loading from '../ui/Loading'
import ErrorBoundary from '../errors/ErrorBoundary'

export default function Layout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading fullScreen />
  }

  if (!isAuthenticated) {
    return <Loading fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="p-4 lg:p-6">
          <ErrorBoundary variant="inline">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
