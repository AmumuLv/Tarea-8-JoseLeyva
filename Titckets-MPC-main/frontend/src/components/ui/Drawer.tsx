import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  headerIcon?: ReactNode
  children: ReactNode
  size?: 'md' | 'lg' | 'xl' | 'full'
  footer?: ReactNode
  loading?: boolean
}

const sizeClasses = {
  md: 'max-w-[38vw]',
  lg: 'max-w-[55vw]',
  xl: 'max-w-[80vw]',
  full: 'max-w-full',
}

export default function Drawer({ isOpen, onClose, title, subtitle, headerIcon, children, size = 'lg', footer, loading }: DrawerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)))
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`relative ml-auto h-full w-full ${sizeClasses[size]} bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-all duration-300 ease-out ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          {headerIcon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              {headerIcon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : children}
        </div>
        {footer && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex-shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
