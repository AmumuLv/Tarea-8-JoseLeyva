import axios from 'axios'
import { friendlyMessage, getValidationErrors, getRequestId } from './errors'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

/**
 * Mensaje amigable centralizado para errores de API, red y timeout.
 * Todos los módulos deben usar este helper (§4 del estándar de errores).
 */
export function getErrorMessage(err: unknown): string {
  return friendlyMessage(err)
}

export { getValidationErrors, getRequestId }

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const isLoginRequest = Boolean(error?.config?.url?.includes('/auth/login'))

    // Sesión inválida o expirada: limpiar token y volver al login (§8)
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?e=401'
        return Promise.reject(error)
      }
    }

    // Diagnóstico técnico solo en desarrollo (nunca en producción)
    if (import.meta.env.DEV && status >= 500) {
      console.error('[api]', {
        method: error?.config?.method,
        url: error?.config?.url,
        status,
        error_code: error?.response?.data?.error_code,
        request_id: error?.response?.data?.request_id,
      })
    }

    return Promise.reject(error)
  }
)

export default api
