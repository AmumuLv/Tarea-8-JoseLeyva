import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  headerIcon?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: ReactNode
  loading?: boolean
  hideHeader?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
  full: 'max-w-6xl',
}

export default function Modal({ isOpen, onClose, title, subtitle, headerIcon, children, size = 'md', footer, loading, hideHeader }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true))
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 pt-8 pb-8 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`relative w-full ${sizeClasses[size]} my-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800 flex flex-col max-h-[90vh] transition-all duration-200 ease-out ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        {!hideHeader && (
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-700 flex-shrink-0">
            {headerIcon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                {headerIcon}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : children}
        </div>
        {footer && (
          <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-700 flex-shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
