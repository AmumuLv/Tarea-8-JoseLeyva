import { Component, type ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** fullscreen: pantalla completa (fuera del Layout). inline: tarjeta dentro del Layout (conserva header/sidebar). */
  variant?: 'fullscreen' | 'inline'
}

interface ErrorBoundaryState {
  error: Error | null
  refCode: string
}

function makeRefCode(): string {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, '0')
  return `REQ-${date}-${random}`
}

/**
 * Captura errores inesperados de React para que la aplicación nunca
 * quede en pantalla blanca (§2 y §16 del estándar de errores).
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, refCode: '' }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error, refCode: makeRefCode() }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // Información técnica solo para diagnóstico; nunca se muestra al usuario
    console.error('[ErrorBoundary]', error, info.componentStack)
    try {
      sessionStorage.setItem(
        'mpc_last_error',
        JSON.stringify({
          refCode: this.state.refCode,
          message: error.message,
          componentStack: info.componentStack?.slice(0, 1000),
          at: new Date().toISOString(),
        })
      )
    } catch {
      // sessionStorage puede no estar disponible
    }
  }

  handleRetry = (): void => {
    this.setState({ error: null, refCode: '' })
  }

  handleHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    const fullscreen = (this.props.variant ?? 'fullscreen') === 'fullscreen'

    const body = (
      <>
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {fullscreen ? 'Algo salió mal' : 'Esta sección no pudo cargarse'}
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Se produjo un error inesperado al cargar esta sección. Puedes intentar nuevamente.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <button
            onClick={this.handleHome}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          Código de referencia: <span className="font-mono">{this.state.refCode}</span>
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Si necesitas reportarlo a OTIC, proporciona este código.
        </p>
      </>
    )

    if (fullscreen) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-950">
          {body}
        </div>
      )
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        {body}
      </div>
    )
  }
}
