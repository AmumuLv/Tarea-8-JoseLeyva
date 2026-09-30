import { AlertTriangle, RefreshCw } from 'lucide-react'

interface LoadErrorProps {
  message?: string
  onRetry?: () => void
}

/**
 * Estado de error reutilizable para listados y cargas de datos (§15).
 */
export default function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <AlertTriangle className="mb-3 h-10 w-10 text-amber-500" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {message ?? 'No se pudieron cargar los datos.'}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Verifica tu conexión e inténtalo nuevamente.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      )}
    </div>
  )
}
