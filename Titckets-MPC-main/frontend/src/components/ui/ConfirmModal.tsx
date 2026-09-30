import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Button from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar',
  variant = 'danger', loading = false,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)))
    } else {
      setIsAnimating(false)
      const t = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 transition-all duration-200 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            <AlertTriangle className={`h-7 w-7 ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</Button>
          <Button variant={variant === 'warning' ? 'secondary' : variant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}
