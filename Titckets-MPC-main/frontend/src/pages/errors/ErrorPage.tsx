import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Home, RefreshCw, SearchX, ShieldX, LogIn, Clock,
  FileWarning, Hourglass, AlertOctagon, CloudOff, Wrench, TimerOff, WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ErrorPageConfig {
  title: string
  description: string
  icon: LucideIcon
  retry?: boolean
  login?: boolean
}

/**
 * Configuración por código HTTP (§1 y §17 del estándar de errores).
 */
const ERROR_CONFIG: Record<number, ErrorPageConfig> = {
  400: {
    title: 'Solicitud no válida',
    description: 'La solicitud contiene datos no válidos. Revisa la información e inténtalo nuevamente.',
    icon: FileWarning,
  },
  401: {
    title: 'No has iniciado sesión',
    description: 'Tu sesión no es válida o ha expirado. Inicia sesión para continuar.',
    icon: LogIn,
    login: true,
  },
  403: {
    title: 'Acceso denegado',
    description: 'No tienes permisos para acceder a esta sección. Contacta al administrador si necesitas acceso.',
    icon: ShieldX,
  },
  404: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe, fue movida o ya no está disponible.',
    icon: SearchX,
  },
  405: {
    title: 'Método no permitido',
    description: 'La solicitud realizada no está permitida para este recurso.',
    icon: AlertOctagon,
  },
  408: {
    title: 'Tiempo de espera agotado',
    description: 'La solicitud está tardando demasiado. Intenta nuevamente en unos momentos.',
    icon: TimerOff,
    retry: true,
  },
  419: {
    title: 'Sesión expirada',
    description: 'Tu sesión ha caducado por seguridad. Vuelve a iniciar sesión.',
    icon: Clock,
    login: true,
  },
  422: {
    title: 'Datos no válidos',
    description: 'Revisa los datos ingresados e inténtalo nuevamente.',
    icon: FileWarning,
  },
  429: {
    title: 'Demasiadas solicitudes',
    description: 'Se han realizado demasiadas solicitudes. Espera unos segundos e inténtalo nuevamente.',
    icon: Hourglass,
    retry: true,
  },
  500: {
    title: 'Algo salió mal',
    description: 'Se produjo un error inesperado. El equipo de OTIC puede revisar el incidente.',
    icon: AlertOctagon,
    retry: true,
  },
  502: {
    title: 'Error de conexión',
    description: 'El servidor no respondió correctamente. Intenta nuevamente en unos minutos.',
    icon: CloudOff,
    retry: true,
  },
  503: {
    title: 'Servicio no disponible',
    description: 'El servicio está temporalmente no disponible. Intenta nuevamente en unos momentos.',
    icon: Wrench,
    retry: true,
  },
  504: {
    title: 'Tiempo de espera agotado',
    description: 'El servidor tardó demasiado en responder. Intenta nuevamente en unos momentos.',
    icon: TimerOff,
    retry: true,
  },
}

interface ErrorPageProps {
  status: number
}

/**
 * Página de error HTTP reutilizable, consistente con el diseño de
 * MPC Service Desk y responsive (§19).
 */
export default function ErrorPage({ status }: ErrorPageProps) {
  const navigate = useNavigate()
  const config = ERROR_CONFIG[status] ?? {
    title: 'Error',
    description: 'Se produjo un error inesperado. Intenta nuevamente.',
    icon: WifiOff,
    retry: status >= 500,
  }
  const Icon = config.icon

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-950">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <Icon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-6xl font-bold text-gray-300 dark:text-gray-700">{status}</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-gray-500 dark:text-gray-400">{config.description}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {config.login && (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </button>
          )}

          {config.retry && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          )}

          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
