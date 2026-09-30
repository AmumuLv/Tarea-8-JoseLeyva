import { useState } from 'react'
import type { ReactNode } from 'react'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange: (id: string) => void
  children: ReactNode
}

export default function Tabs({ tabs, activeTab, onChange, children }: TabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id)

  const handleChange = (id: string) => {
    setActive(id)
    onChange(id)
  }

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                active === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}
