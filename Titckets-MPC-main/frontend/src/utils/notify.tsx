import { toast as baseToast } from 'react-hot-toast'
import type { ToastOptions, DefaultToastOptions, Renderable, Toast as ToastItem, ValueOrFunction } from 'react-hot-toast'
import { AlertTriangle, Info } from 'lucide-react'

type Message = ValueOrFunction<Renderable, ToastItem>

const DEDUPE_MS = 2500
const recent = new Map<string, number>()

function shouldSkip(key: string | null): boolean {
  if (!key) return false

  const now = Date.now()
  const last = recent.get(key)
  recent.set(key, now)

  if (recent.size > 50) {
    for (const [k, t] of recent) {
      if (now - t > DEDUPE_MS) recent.delete(k)
    }
  }

  return Boolean(last && now - last < DEDUPE_MS)
}

function show(type: 'default' | 'success' | 'error' | 'warning' | 'info', message: Message, options?: ToastOptions): string {
  const key = typeof message === 'string' ? `${type}|${message}` : null
  if (shouldSkip(key)) return ''

  switch (type) {
    case 'success':
      return baseToast.success(message, options)
    case 'error':
      return baseToast.error(message, options)
    case 'warning':
      return baseToast(message, { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, ...options })
    case 'info':
      return baseToast(message, { icon: <Info className="h-5 w-5 text-blue-500" />, ...options })
    default:
      return baseToast(message, options)
  }
}

interface NotifyToast {
  (message: Message, options?: ToastOptions): string
  success: (message: Message, options?: ToastOptions) => string
  error: (message: Message, options?: ToastOptions) => string
  warning: (message: Message, options?: ToastOptions) => string
  info: (message: Message, options?: ToastOptions) => string
  loading: (message: Message, options?: ToastOptions) => string
  custom: (message: Message, options?: ToastOptions) => string
  dismiss: (toastId?: string, toasterId?: string) => void
  dismissAll: (toasterId?: string) => void
  remove: (toastId?: string, toasterId?: string) => void
  removeAll: (toasterId?: string) => void
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    msgs: { loading: Renderable; success?: ValueOrFunction<Renderable, T>; error?: ValueOrFunction<Renderable, any> },
    options?: DefaultToastOptions
  ) => Promise<T>
}

/**
 * Toast centralizado con deduplicación: evita toasts repetidos para el
 * mismo mensaje en poca tiempo y agrega variantes warning/info (§14).
 */
export const toast: NotifyToast = Object.assign(
  (message: Message, options?: ToastOptions) => show('default', message, options),
  {
    success: (message: Message, options?: ToastOptions) => show('success', message, options),
    error: (message: Message, options?: ToastOptions) => show('error', message, options),
    warning: (message: Message, options?: ToastOptions) => show('warning', message, options),
    info: (message: Message, options?: ToastOptions) => show('info', message, options),
    loading: (message: Message, options?: ToastOptions) => baseToast.loading(message, options),
    custom: (message: Message, options?: ToastOptions) => baseToast.custom(message, options),
    dismiss: baseToast.dismiss,
    dismissAll: baseToast.dismissAll,
    remove: baseToast.remove,
    removeAll: baseToast.removeAll,
    promise: baseToast.promise,
  }
)

export default toast
