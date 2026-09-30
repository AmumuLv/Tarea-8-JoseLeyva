import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertProps {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  className?: string
}

const variantConfig = {
  info: {
    icon: Info,
    classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
}

export default function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${config.classes} ${className}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  )
}
