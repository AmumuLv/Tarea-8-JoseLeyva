import { useState } from 'react'
import { Send } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'
import toast from '../../utils/notify'
import { getErrorMessage } from '../../api/axios'
import { createRespuesta } from '../../api/respuestaApi'

interface Message {
  id: number
  respuesta: string
  created_at: string
  usuario?: { nombres?: string; apellidos?: string; name?: string; id?: number }
}

interface TicketChatProps {
  ticketId: number
  respuestas: Message[]
  currentUserId?: number
  onRefresh: () => void
}

export default function TicketChat({ ticketId, respuestas, currentUserId, onRefresh }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSending(true)
    try {
      await createRespuesta(ticketId, { respuesta: newMessage })
      setNewMessage('')
      onRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
        {respuestas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay mensajes aún. Inicia la conversación.</p>
          </div>
        ) : (
          respuestas.map((msg) => {
            const isOwn = currentUserId && msg.usuario?.id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isOwn ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {msg.usuario?.nombres ? msg.usuario.nombres.charAt(0).toUpperCase() : msg.usuario?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{msg.usuario?.nombres ? `${msg.usuario.nombres} ${msg.usuario.apellidos}` : msg.usuario?.name || 'Usuario'}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDateTime(msg.created_at)}</span>
                  </div>
                  <div className={`rounded-xl px-4 py-2.5 text-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-sm'}`}>
                    {msg.respuesta}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
        />
        <button type="submit" disabled={sending || !newMessage.trim()} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
