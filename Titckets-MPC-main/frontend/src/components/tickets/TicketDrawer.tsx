import { useState, useEffect, useRef } from 'react'
import toast from '../../utils/notify'
import api, { getErrorMessage } from '../../api/axios'
import { getTicket, cambiarEstado, asignarTecnico, historial, uploadEvidencia, deleteEvidencia } from '../../api/ticketApi'
import { getRespuestas, createRespuesta } from '../../api/respuestaApi'
import { getAllTecnicos } from '../../api/tecnicoApi'
import { ESTADOS_TICKET, CATEGORIAS, ESTADO_DOT_COLOR } from '../../utils/constants'
import TicketTimeline from './TicketTimeline'
import { formatDateTime, formatFileSize } from '../../utils/formatters'
import usePermission from '../../hooks/usePermission'
import { PERMISOS } from '../../utils/permissions'
import {
  X, Maximize2, Minimize2, UserPlus, RefreshCw, MoreHorizontal,
  Building2, User, Shield, Tag, Calendar, Clock, FileText,
  Download, Send, Paperclip, MessageSquare,
  Upload, Trash2, Loader2, Eye, AlertCircle,
} from 'lucide-react'

interface TicketDrawerProps {
  isOpen: boolean
  onClose: () => void
  ticketId: number | null
  currentUserId?: number
  onRefresh?: () => void
}

type TabId = 'info' | 'historial' | 'comentarios' | 'archivos' | 'auditoria'

const tabsConfig: { id: TabId; label: string; icon: any; adminOnly?: boolean }[] = [
  { id: 'info', label: 'Información', icon: Eye },
  { id: 'historial', label: 'Historial', icon: Clock },
  { id: 'comentarios', label: 'Comentarios', icon: MessageSquare },
  { id: 'archivos', label: 'Archivos', icon: FileText },
  { id: 'auditoria', label: 'Auditoría', icon: Shield, adminOnly: true },
]

export default function TicketDrawer({ isOpen, onClose, ticketId, currentUserId, onRefresh }: TicketDrawerProps) {
  const { hasPermission } = usePermission()
  const [ticket, setTicket] = useState<any>(null)
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [historialData, setHistorialData] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('info')
  const [isMaximized, setIsMaximized] = useState(false)

  const [showAsignar, setShowAsignar] = useState(false)
  const [showEstado, setShowEstado] = useState(false)
  const [showMasAcciones, setShowMasAcciones] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && ticketId) loadTicket()
  }, [isOpen, ticketId])

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

  const loadTicket = async () => {
    if (!ticketId) return
    setLoading(true)
    try {
      const [ticketRes, respuestasRes, historialRes] = await Promise.all([
        getTicket(ticketId), getRespuestas(ticketId), historial(ticketId),
      ])
      setTicket(ticketRes.data)
      setRespuestas(respuestasRes.data || [])
      setHistorialData(historialRes.data || [])
      if (hasPermission(PERMISOS.ASIGNAR_TECNICO)) {
        getAllTecnicos()
          .then((tecnicosRes) => setTecnicos(tecnicosRes.data || []))
          .catch(() => setTecnicos([]))
      } else {
        setTecnicos([])
      }
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!ticket) return
    try { await cambiarEstado(ticket.id, nuevoEstado); toast.success('Estado actualizado'); loadTicket(); onRefresh?.(); setShowEstado(false) }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleAsignar = async (tecnicoId: string) => {
    if (!ticket) return
    try { await asignarTecnico(ticket.id, Number(tecnicoId)); toast.success('Técnico asignado'); loadTicket(); onRefresh?.(); setShowAsignar(false) }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const downloadPdf = async () => {
    if (!ticket) return
    try {
      const response = await api.get(`/tickets/${ticket.id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${ticket.numero}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !ticket) return
    setSendingComment(true)
    try {
      await createRespuesta(ticket.id, { respuesta: newComment })
      setNewComment('')
      toast.success('Comentario enviado')
      const res = await getRespuestas(ticket.id)
      setRespuestas(res.data || [])
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSendingComment(false) }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !ticket) return
    setUploading(true)
    const formData = new FormData()
    formData.append('evidencia', file)
    try {
      await uploadEvidencia(ticket.id, formData)
      toast.success('Archivo subido')
      loadTicket()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleDeleteFile = async (id: number) => {
    if (!ticket) return
    setDeleting(id)
    try {
      await deleteEvidencia(ticket.id, id)
      toast.success('Archivo eliminado')
      loadTicket()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setDeleting(null) }
  }

  const getNextStates = (estado: string) => {
    const transitions: Record<string, string[]> = {
      pendiente: ['asignado', 'cancelado'], asignado: ['en_proceso', 'en_espera', 'cancelado'],
      en_proceso: ['resuelto', 'en_espera', 'cancelado'], en_espera: ['en_proceso', 'cancelado'],
      resuelto: ['cerrado'], cerrado: [], cancelado: [],
    }
    return transitions[estado] || []
  }

  const tecnicoOptions = tecnicos.map((t: any) => ({
    value: String(t.id),
    label: t.nombres || t.apellidos ? `${t.alias} (${t.nombres || ''} ${t.apellidos || ''})`.trim() : t.alias,
  }))

  const getElapsed = () => {
    if (!ticket?.created_at) return '—'
    const diff = Date.now() - new Date(ticket.created_at).getTime()
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return '<1h'
  }

  const getStateColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-gray-100 text-gray-700',
      asignado: 'bg-blue-100 text-blue-700',
      en_proceso: 'bg-amber-100 text-amber-700',
      en_espera: 'bg-purple-100 text-purple-700',
      resuelto: 'bg-emerald-100 text-emerald-700',
      cerrado: 'bg-gray-200 text-gray-600',
      cancelado: 'bg-red-100 text-red-700',
    }
    return colors[estado] || 'bg-gray-100 text-gray-700'
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ left: 0, right: 0, bottom: 0, top: 0 }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
        <div
          className={`absolute top-0 right-0 h-full bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out ${isMaximized ? 'w-full' : 'w-[780px] max-w-[90vw]'}`}
          style={{ animation: isOpen ? 'slideIn 0.3s ease-out' : undefined }}
        >
          {loading && !ticket ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : ticket && (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">{ticket.numero}</h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStateColor(ticket.estado)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[ticket.estado]}`} />
                      {ESTADOS_TICKET[ticket.estado]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Creado el {formatDateTime(ticket.created_at)}</p>
                </div>
                <button onClick={downloadPdf} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors" title="Descargar PDF">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action Bar */}
              {ticket.estado !== 'cerrado' && ticket.estado !== 'cancelado' && (hasPermission(PERMISOS.ASIGNAR_TECNICO) || hasPermission(PERMISOS.CAMBIAR_ESTADO)) && (
                <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-50 flex-shrink-0">
                  {hasPermission(PERMISOS.ASIGNAR_TECNICO) && (
                  <div className="relative">
                    <button onClick={() => { setShowAsignar(!showAsignar); setShowEstado(false); setShowMasAcciones(false) }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <UserPlus className="h-3.5 w-3.5" /> Asignar
                    </button>
                    {showAsignar && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 max-h-60 overflow-y-auto">
                        {tecnicoOptions.map((opt) => (
                          <button key={opt.value} onClick={() => handleAsignar(opt.value)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                              {opt.label.charAt(0)}
                            </div>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                  {hasPermission(PERMISOS.CAMBIAR_ESTADO) && (
                  <div className="relative">
                    <button onClick={() => { setShowEstado(!showEstado); setShowAsignar(false); setShowMasAcciones(false) }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" /> Cambiar estado
                    </button>
                    {showEstado && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                        {getNextStates(ticket.estado).map((s) => (
                          <button key={s} onClick={() => handleCambiarEstado(s)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${ESTADO_DOT_COLOR[s]}`} />
                            {ESTADOS_TICKET[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                  <div className="relative">
                    <button onClick={() => { setShowMasAcciones(!showMasAcciones); setShowAsignar(false); setShowEstado(false) }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5" /> Más acciones
                    </button>
                    {showMasAcciones && (
                      <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                        <button onClick={() => { navigator.clipboard.writeText(ticket.numero); toast.success('Número copiado'); setShowMasAcciones(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Copiar número</button>
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('URL copiada'); setShowMasAcciones(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Copiar enlace</button>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={() => { downloadPdf(); setShowMasAcciones(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"><Download className="h-4 w-4" /> Descargar PDF</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-0 px-6 border-b border-gray-100 flex-shrink-0">
                {tabsConfig.filter(t => !t.adminOnly || hasPermission(PERMISOS.VER_AUDITORIA)).map((tab) => {
                  const count = tab.id === 'comentarios' ? respuestas.length : tab.id === 'archivos' ? (ticket.evidencias?.length || 0) : undefined
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors ${
                        activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                      {count !== undefined && count > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5">
                          {count}
                        </span>
                      )}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {activeTab === 'info' && (
                  <div className="space-y-5">
                    {/* Información general */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Información general</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoCard icon={Building2} label="Área" value={ticket.area?.nombre || '—'} />
                        <InfoCard icon={UserPlus} label="Técnico asignado" value={ticket.assigned_to ? `${ticket.assigned_to.nombres} ${ticket.assigned_to.apellidos}` : 'Sin asignar'} sub={ticket.assigned_to?.email} />
                        <InfoCard icon={User} label="Solicitante" value={ticket.created_by ? `${ticket.created_by.nombres} ${ticket.created_by.apellidos}` : '—'} sub={ticket.created_by?.email} />
                        <InfoCard icon={Calendar} label="Fecha de creación" value={formatDateTime(ticket.created_at)} />
                        <InfoCard icon={Shield} label="Prioridad" value={ticket.prioridad ? ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1) : '—'} />
                        <InfoCard icon={Clock} label="Última actualización" value={ticket.updated_at ? formatDateTime(ticket.updated_at) : '—'} />
                        <InfoCard icon={Tag} label="Categoría" value={CATEGORIAS[ticket.categoria] || ticket.categoria || '—'} />
                        <InfoCard icon={AlertCircle} label="Incidencia" value={ticket.titulo || '—'} />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Descripción del problema</h3>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>

                    {/* Evidencias */}
                    {ticket.evidencias && ticket.evidencias.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Evidencia adjunta ({ticket.evidencias.length})</h3>
                        <div className="grid grid-cols-4 gap-3">
                          {ticket.evidencias.map((ev: any) => (
                            <div key={ev.id} className="group relative rounded-xl border border-gray-100 overflow-hidden bg-white">
                              <div className="aspect-square relative overflow-hidden">
                                {ev.ruta?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                  <img src={`/storage/${ev.ruta}`} alt={ev.nombre_original} className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setPreviewImage(`/storage/${ev.ruta}`)} />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-[10px] font-medium text-gray-600 truncate">{ev.nombre_original}</p>
                                <p className="text-[9px] text-gray-400">{ev.tamano ? formatFileSize(ev.tamano) : ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumen rápido */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resumen rápido</h3>
                      <div className="grid grid-cols-4 gap-3">
                        <QuickStat icon={MessageSquare} label="Comentarios" value={respuestas.length} color="text-blue-600 bg-blue-50" />
                        <QuickStat icon={Clock} label="Historial" value={historialData.length} color="text-amber-600 bg-amber-50" />
                        <QuickStat icon={FileText} label="Archivos" value={ticket.evidencias?.length || 0} color="text-emerald-600 bg-emerald-50" />
                        <QuickStat icon={Clock} label="Tiempo" value={getElapsed()} color="text-purple-600 bg-purple-50" isText />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'historial' && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <TicketTimeline historial={historialData} />
                  </div>
                )}

                {activeTab === 'comentarios' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 mb-4 max-h-[500px] overflow-y-auto">
                      {respuestas.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">No hay comentarios aún</p>
                        </div>
                      ) : (
                        respuestas.map((msg: any) => {
                          const isOwn = currentUserId && msg.usuario?.id === currentUserId
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isOwn ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {msg.usuario?.nombres?.charAt(0)?.toUpperCase() || msg.usuario?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">{msg.usuario?.nombres ? `${msg.usuario.nombres} ${msg.usuario.apellidos}` : msg.usuario?.name || 'Usuario'}</span>
                                  <span className="text-[10px] text-gray-400">{formatDateTime(msg.created_at)}</span>
                                </div>
                                <div className={`rounded-xl px-4 py-2.5 text-sm ${isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                  {msg.respuesta}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    <form onSubmit={handleSendComment} className="flex items-center gap-2 border-t border-gray-100 pt-4">
                      <input ref={commentInputRef} type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button type="submit" disabled={sendingComment || !newComment.trim()} className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                    <input ref={fileInputRef} type="file" onChange={handleUploadFile} className="hidden" />
                  </div>
                )}

                {activeTab === 'archivos' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Archivos adjuntos</h3>
                      <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                        <Upload className="h-3.5 w-3.5" /> Subir archivo
                      </button>
                      <input ref={fileInputRef} type="file" onChange={handleUploadFile} className="hidden" />
                    </div>
                    {!ticket.evidencias || ticket.evidencias.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No hay archivos adjuntos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ticket.evidencias.map((ev: any) => (
                          <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 hover:bg-gray-50 transition-colors group">
                            {ev.ruta?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                              <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={`/storage/${ev.ruta}`} alt={ev.nombre_original} className="h-full w-full object-cover cursor-pointer" onClick={() => setPreviewImage(`/storage/${ev.ruta}`)} />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-red-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{ev.nombre_original}</p>
                              <p className="text-xs text-gray-400">{ev.tamano ? formatFileSize(ev.tamano) : ''}</p>
                            </div>
                            <a href={`/storage/${ev.ruta}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all">
                              <Download className="h-4 w-4" />
                            </a>
                            <button onClick={() => handleDeleteFile(ev.id)} disabled={deleting === ev.id} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                              {deleting === ev.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <button onClick={onClose} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Vista previa" className="max-h-[85vh] max-w-[85vw] rounded-2xl shadow-2xl object-contain" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function QuickStat({ icon: Icon, label, value, color, isText }: { icon: any; label: string; value: number | string; color: string; isText?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color} mb-2`}>
        {isText ? <Icon className="h-4 w-4" /> : <span className="text-sm font-bold">{value}</span>}
      </div>
      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
      {isText && <p className="text-xs font-bold text-gray-700 mt-0.5">{value}</p>}
    </div>
  )
}
