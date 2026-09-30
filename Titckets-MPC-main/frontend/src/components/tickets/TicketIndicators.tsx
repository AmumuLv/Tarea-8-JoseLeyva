import { Camera, UserX } from 'lucide-react'

interface TicketIndicatorsProps {
  ticket: {
    evidencias?: any[]
    asignado_a?: number | null
  }
}

export default function TicketIndicators({ ticket }: TicketIndicatorsProps) {
  const indicators: { icon: any; color: string; label: string; bgColor: string }[] = []

  if (ticket.evidencias && ticket.evidencias.length > 0) {
    indicators.push({ icon: Camera, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-900/20', label: `${ticket.evidencias.length} evidencia(s)` })
  }

  if (!ticket.asignado_a) {
    indicators.push({ icon: UserX, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-900/20', label: 'Sin técnico' })
  }

  if (indicators.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {indicators.map((ind, idx) => (
        <span
          key={idx}
          title={ind.label}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${ind.bgColor} ${ind.color}`}
        >
          <ind.icon className="h-3 w-3" />
          {ind.label}
        </span>
      ))}
    </div>
  )
}
