import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export default function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
}

export function TableRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </td>
  )
}
