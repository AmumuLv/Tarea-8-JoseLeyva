import { formatDateTime } from '../../utils/formatters'
import { ESTADOS_TICKET, ESTADO_DOT_COLOR } from '../../utils/constants'
import { TicketPlus, Pencil, ArrowRightLeft, AlertTriangle, UserPlus, MessageSquare, Camera, Star, Reply, Clock } from 'lucide-react'

interface TimelineEvent {
  id: number
  tipo_cambio: string
  valor_anterior?: string
  valor_nuevo?: string
  comentario?: string
  created_at: string
  usuario?: { nombres?: string; apellidos?: string; name?: string; email?: string }
}

const tipoCambioConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  creacion: { icon: TicketPlus, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Ticket Creado' },
  actualizacion: { icon: Pencil, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Actualización' },
  estado: { icon: ArrowRightLeft, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Cambio de Estado' },
  prioridad: { icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'Cambio de Prioridad' },
  asignacion: { icon: UserPlus, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'Asignación' },
  comentario: { icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Comentario' },
  evidencia: { icon: Camera, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30', label: 'Evidencia' },
  calificacion: { icon: Star, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', label: 'Calificación' },
  respuesta: { icon: Reply, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', label: 'Respuesta' },
}

interface TicketTimelineProps {
  historial: TimelineEvent[]
}

export default function TicketTimeline({ historial }: TicketTimelineProps) {
  if (!historial || historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Clock className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Sin eventos en la línea de tiempo</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {historial.map((evento, idx) => {
          const config = tipoCambioConfig[evento.tipo_cambio] || tipoCambioConfig.actualizacion
          const Icon = config.icon
          const isLast = idx === historial.length - 1

          return (
            <li key={evento.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                )}
                <div className="relative flex items-start gap-3">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor} ring-4 ring-white dark:ring-gray-900`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{config.label}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {evento.usuario?.nombres ? `${evento.usuario.nombres} ${evento.usuario.apellidos}` : evento.usuario?.name || 'Sistema'}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {evento.tipo_cambio === 'estado' && evento.valor_anterior && evento.valor_nuevo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${ESTADO_DOT_COLOR[evento.valor_anterior] ? `bg-gray-100 dark:bg-gray-700` : ''}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[evento.valor_anterior] || 'bg-gray-400'}`} />
                            {ESTADOS_TICKET[evento.valor_anterior] || evento.valor_anterior}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700">
                            <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[evento.valor_nuevo] || 'bg-gray-400'}`} />
                            {ESTADOS_TICKET[evento.valor_nuevo] || evento.valor_nuevo}
                          </span>
                        </div>
                      )}
                      {evento.tipo_cambio === 'prioridad' && evento.valor_anterior && evento.valor_nuevo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700">
                            {evento.valor_anterior}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700">
                            {evento.valor_nuevo}
                          </span>
                        </div>
                      )}
                      {evento.tipo_cambio !== 'estado' && evento.tipo_cambio !== 'prioridad' && (
                        <p>{evento.comentario || (evento.valor_nuevo ? `Valor: ${evento.valor_nuevo}` : '')}</p>
                      )}
                      {evento.comentario && evento.tipo_cambio !== 'estado' && evento.tipo_cambio !== 'prioridad' && (
                        <p className="mt-1 italic text-gray-500 dark:text-gray-400">"{evento.comentario}"</p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(evento.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
