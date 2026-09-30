import { useState } from 'react'
import { Camera, MessageSquare, Clock, History } from 'lucide-react'
import { formatElapsed, formatDate } from '../../utils/formatters'
import TicketChat from './TicketChat'
import TicketEvidenciaGallery from './TicketEvidenciaGallery'
import TicketTimeline from './TicketTimeline'

interface ExpandableRowProps {
  ticket: any
  colSpan: number
  respuestas?: any[]
  historial?: any[]
  currentUserId?: number
  onRefresh?: () => void
}

export default function ExpandableRow({ ticket, colSpan, respuestas = [], historial = [], currentUserId, onRefresh }: ExpandableRowProps) {
  const evidenciaCount = ticket.evidencias?.length || 0
  const respuestaCount = respuestas.length || ticket.respuestas?.length || 0

  return (
    <tr>
      <td colSpan={colSpan} className="px-0 py-0">
        <div className="mx-3 mb-4 mt-1 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 dark:border-blue-900/30 dark:from-blue-900/10 dark:to-gray-900 animate-in slide-in-from-top-1 duration-200">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="col-span-2">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Descripción</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{ticket.descripcion || 'Sin descripción'}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Solicitante</h4>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                  {ticket.created_by?.nombres?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.created_by ? `${ticket.created_by.nombres} ${ticket.created_by.apellidos}` : '—'}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{ticket.created_by?.email || ''}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Tiempos</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>Creado: <span className="font-medium text-gray-900 dark:text-white">{formatDate(ticket.created_at)}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>Transcurrido: <span className="font-medium text-gray-900 dark:text-white">{formatElapsed(ticket.created_at)}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{respuestaCount} comentarios</span>
              <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" />{evidenciaCount} evidencias</span>
            </div>
          </div>

          <ExpandableTabs ticket={ticket} respuestas={respuestas} historial={historial} currentUserId={currentUserId} onRefresh={onRefresh} />
        </div>
      </td>
    </tr>
  )
}

function ExpandableTabs({ ticket, respuestas, historial, currentUserId, onRefresh }: {
  ticket: any; respuestas: any[]; historial: any[]; currentUserId?: number; onRefresh?: () => void
}) {
  const [tab, setTab] = useState<'chat' | 'evidencias' | 'historial'>('chat')

  const tabs = [
    { id: 'chat' as const, label: 'Conversación', icon: MessageSquare, count: respuestas.length },
    { id: 'evidencias' as const, label: 'Evidencias', icon: Camera, count: ticket.evidencias?.length || 0 },
    { id: 'historial' as const, label: 'Historial', icon: History, count: historial.length },
  ]

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                tab === t.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
        {tab === 'chat' && (
          <TicketChat ticketId={ticket.id} respuestas={respuestas} currentUserId={currentUserId} onRefresh={onRefresh || (() => {})} />
        )}
        {tab === 'evidencias' && (
          <TicketEvidenciaGallery
            ticketId={ticket.id}
            evidencias={ticket.evidencias || []}
            canUpload={ticket.estado !== 'cerrado' && ticket.estado !== 'cancelado'}
            canDelete={ticket.estado !== 'cerrado'}
            onRefresh={onRefresh || (() => {})}
          />
        )}
        {tab === 'historial' && (
          <TicketTimeline historial={historial} />
        )}
      </div>
    </div>
  )
}
