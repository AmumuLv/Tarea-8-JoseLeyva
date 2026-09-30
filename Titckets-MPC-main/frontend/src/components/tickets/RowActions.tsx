import { useState, useEffect, useRef, useCallback } from 'react'
import { MoreVertical, XCircle, RefreshCw } from 'lucide-react'

interface RowActionsProps {
  onCloseTicket?: () => void
  onReopen?: () => void
  isTerminal?: boolean
}

export default function RowActions({ onCloseTicket, onReopen, isTerminal }: RowActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const positionMenu = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.top - 8, left: rect.right - 192 })
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) positionMenu()
  }, [open, positionMenu])

  const menuItems = [
    ...(onCloseTicket && !isTerminal ? [{ icon: XCircle, label: 'Cerrar ticket', onClick: () => { onCloseTicket(); setOpen(false) } }] : []),
    ...(onReopen && isTerminal ? [{ icon: RefreshCw, label: 'Reabrir ticket', onClick: () => { onReopen(); setOpen(false) } }] : []),
  ]

  if (menuItems.length === 0) return null

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-48 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl"
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
          >
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                  (item as any).danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
