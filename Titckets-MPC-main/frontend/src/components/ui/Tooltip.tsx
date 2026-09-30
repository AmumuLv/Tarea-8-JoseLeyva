import { useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = () => { clearTimeout(timeoutRef.current); setVisible(true) }
  const hide = () => { timeoutRef.current = setTimeout(() => setVisible(false), 150) }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className={`absolute z-50 pointer-events-none ${positionClasses[position]}`}>
          <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap dark:bg-gray-700">
            {content}
            <div className={`absolute ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700' : position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700' : position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700' : 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700'}`} />
          </div>
        </div>
      )}
    </div>
  )
}
