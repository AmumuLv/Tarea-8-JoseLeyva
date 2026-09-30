export interface ApiErrorResponse {
  success?: false
  message?: string
  error_code?: string
  errors?: Record<string, string[]>
  request_id?: string
}

interface AxiosLikeError {
  response?: { status?: number; data?: unknown; headers?: Record<string, string> }
  config?: { url?: string }
  code?: string
  request?: unknown
}

export function isAxiosLike(err: unknown): err is AxiosLikeError {
  return typeof err === 'object' && err !== null && ('response' in err || 'code' in err || 'request' in err)
}

export function getErrorStatus(err: unknown): number | undefined {
  if (!isAxiosLike(err)) return undefined
  return err.response?.status
}

export function getErrorData(err: unknown): ApiErrorResponse | undefined {
  const data = isAxiosLike(err) ? err.response?.data : undefined
  if (data && typeof data === 'object') return data as ApiErrorResponse
  return undefined
}

export function isTimeoutError(err: unknown): boolean {
  if (!isAxiosLike(err) || err.response) return false
  const code = (err as { code?: string }).code
  const message = String((err as { message?: string }).message ?? '')
  return code === 'ECONNABORTED' || code === 'ETIMEDOUT' || message.includes('timeout')
}

export function isNetworkError(err: unknown): boolean {
  if (!isAxiosLike(err) || err.response) return false
  return !isTimeoutError(err)
}

export function getRequestId(err: unknown): string | undefined {
  const data = getErrorData(err)
  if (data?.request_id) return data.request_id
  if (isAxiosLike(err)) {
    const header = err.response?.headers?.['x-request-id']
    if (header) return header
  }
  return undefined
}

export function getValidationErrors(err: unknown): Record<string, string> | null {
  const errors = getErrorData(err)?.errors
  if (!errors) return null

  const result: Record<string, string> = {}
  for (const [field, messages] of Object.entries(errors)) {
    const first = Array.isArray(messages) ? messages[0] : String(messages)
    if (first) result[field] = first
  }

  return Object.keys(result).length ? result : null
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida. Revisa los datos ingresados.',
  401: 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe o ya no está disponible.',
  405: 'Método de solicitud no permitido.',
  408: 'La solicitud está tardando demasiado. Intenta nuevamente en unos momentos.',
  419: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  422: 'Revisa los datos ingresados.',
  429: 'Se han realizado demasiadas solicitudes. Espera unos segundos e inténtalo nuevamente.',
  500: 'Se produjo un error inesperado. El equipo de OTIC puede revisar el incidente.',
  502: 'El servicio no está disponible en este momento. Intenta nuevamente en unos minutos.',
  503: 'El servicio está temporalmente no disponible. Intenta nuevamente en unos momentos.',
  504: 'El servidor tardó demasiado en responder. Intenta nuevamente en unos momentos.',
}

const NETWORK_MESSAGE =
  'No se pudo conectar con el servidor. Verifica tu conexión a Internet e inténtalo nuevamente.'

const TIMEOUT_MESSAGE =
  'La solicitud está tardando demasiado. Intenta nuevamente en unos momentos.'

/**
 * Mensaje amigable y centralizado para cualquier error de la aplicación.
 * Los errores técnicos (stack traces, SQL, modelos) nunca llegan aquí:
 * el backend ya responde con mensajes genéricos en español.
 */
export function friendlyMessage(err: unknown): string {
  if (isTimeoutError(err)) return TIMEOUT_MESSAGE
  if (isNetworkError(err)) return NETWORK_MESSAGE

  const data = getErrorData(err)
  const status = getErrorStatus(err)

  if (data?.message) {
    // Añadir el detalle de validación más relevante al mensaje genérico
    if (status === 422 && data.errors) {
      const first = getValidationErrors(err)
      const firstField = first ? Object.values(first)[0] : null
      if (firstField && firstField !== data.message) {
        return `${data.message} ${firstField}`
      }
    }

    // Vincular error interno con los logs del servidor (§12)
    if (status && status >= 500 && data.request_id) {
      return `${data.message} (Código: ${data.request_id})`
    }

    return data.message
  }

  if (status && STATUS_MESSAGES[status]) {
    const base = STATUS_MESSAGES[status]
    const requestId = getRequestId(err)
    return status >= 500 && requestId ? `${base} (Código: ${requestId})` : base
  }

  if (status) return 'No se pudo completar la operación. Intenta nuevamente.'

  return NETWORK_MESSAGE
}
