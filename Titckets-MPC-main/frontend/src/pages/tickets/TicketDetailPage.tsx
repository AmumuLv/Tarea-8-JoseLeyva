import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from '../../utils/notify'
import { getErrorMessage } from '../../api/axios'
import { getTicket, cambiarEstado, asignarTecnico, historial } from '../../api/ticketApi'
import { getRespuestas } from '../../api/respuestaApi'
import { getAllTecnicos } from '../../api/tecnicoApi'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Loading from '../../components/ui/Loading'
import TicketTimeline from '../../components/tickets/TicketTimeline'
import TicketChat from '../../components/tickets/TicketChat'
import TicketEvidenciaGallery from '../../components/tickets/TicketEvidenciaGallery'
import { formatDateTime } from '../../utils/formatters'
import { ESTADOS_TICKET, CATEGORIAS, ESTADO_DOT_COLOR } from '../../utils/constants'
import useAuth from '../../hooks/useAuth'
import usePermission from '../../hooks/usePermission'
import { PERMISOS } from '../../utils/permissions'
import { ArrowLeft, User, Building2, Tag, Clock, MessageSquare, Camera, History } from 'lucide-react'

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasPermission } = usePermission()
  const [ticket, setTicket] = useState<any>(null)
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [historialData, setHistorialData] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'historial' | 'evidencias'>('info')

  useEffect(() => {
    if (id) loadTicket()
  }, [id])

  const loadTicket = async () => {
    setLoading(true)
    try {
      const ticketId = Number(id)
      const [ticketRes, respuestasRes, historialRes] = await Promise.all([
        getTicket(ticketId),
        getRespuestas(ticketId),
        historial(ticketId),
      ])
      setTicket(ticketRes.data)
      setRespuestas(respuestasRes.data || [])
      setHistorialData(historialRes.data || [])
      if (hasPermission(PERMISOS.ASIGNAR_TECNICO)) {
        try {
          const tecnicosRes = await getAllTecnicos()
          setTecnicos(tecnicosRes.data || [])
        } catch {
          setTecnicos([])
        }
      } else {
        setTecnicos([])
      }
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (nuevoEstado: string) => {
    try {
      await cambiarEstado(Number(id), nuevoEstado)
      toast.success('Estado actualizado')
      loadTicket()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleAsignar = async (tecnicoId: string) => {
    try {
      await asignarTecnico(Number(id), Number(tecnicoId))
      toast.success('Técnico asignado')
      loadTicket()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (loading) return <Loading />
  if (!ticket) return <div className="text-center py-8 text-gray-500">Ticket no encontrado</div>

  const tecnicoOptions = tecnicos
    .map((t: any) => ({
      value: String(t.id),
      label: t.nombres || t.apellidos ? `${t.alias} (${t.nombres || ''} ${t.apellidos || ''})`.trim() : t.alias,
    }))

  const getNextStates = (estado: string) => {
    const transitions: Record<string, string[]> = {
      pendiente: ['asignado', 'cancelado'],
      asignado: ['en_proceso', 'en_espera', 'cancelado'],
      en_proceso: ['resuelto', 'en_espera', 'cancelado'],
      en_espera: ['en_proceso', 'cancelado'],
      resuelto: ['cerrado'],
      cerrado: [],
      cancelado: [],
    }
    return transitions[estado] || []
  }

  const tabs = [
    { id: 'info' as const, label: 'Info', icon: User },
    { id: 'chat' as const, label: `Chat (${respuestas.length})`, icon: MessageSquare },
    { id: 'evidencias' as const, label: `Evidencias (${ticket.evidencias?.length || 0})`, icon: Camera },
    { id: 'historial' as const, label: `Historial (${historialData.length})`, icon: History },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/tickets')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver a tickets
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.numero}</h1>
            <Badge variant="default">
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[ticket.estado]}`} />
              {ESTADOS_TICKET[ticket.estado]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ticket.titulo}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'info' && (
            <>
              <Card>
                <CardBody>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción</h2>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ticket.descripcion}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{CATEGORIAS[ticket.categoria] || ticket.categoria}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDateTime(ticket.created_at)}</span>
                    {ticket.assigned_to && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />Técnico: {ticket.assigned_to.nombres} {ticket.assigned_to.apellidos}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Solicitante</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.created_by ? `${ticket.created_by.nombres} ${ticket.created_by.apellidos}` : '—'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.created_by?.email || ''}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Oficina</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.area?.nombre || '—'}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'chat' && (
            <Card>
              <CardBody>
                <TicketChat ticketId={ticket.id} respuestas={respuestas} currentUserId={user?.id} onRefresh={loadTicket} />
              </CardBody>
            </Card>
          )}

          {activeTab === 'evidencias' && (
            <Card>
              <CardBody>
                <TicketEvidenciaGallery
                  ticketId={ticket.id}
                  evidencias={ticket.evidencias || []}
                  canUpload={ticket.estado !== 'cerrado' && ticket.estado !== 'cancelado'}
                  canDelete={ticket.estado !== 'cerrado'}
                  onRefresh={loadTicket}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'historial' && (
            <Card>
              <CardBody>
                <TicketTimeline historial={historialData} />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {ticket.estado !== 'cerrado' && ticket.estado !== 'cancelado' &&
            (hasPermission(PERMISOS.CAMBIAR_ESTADO) || hasPermission(PERMISOS.ASIGNAR_TECNICO)) && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Acciones</h3>
                <div className="space-y-3">
                  {hasPermission(PERMISOS.CAMBIAR_ESTADO) && (
                    <Select
                      label="Cambiar Estado"
                      value=""
                      onChange={(e) => handleCambiarEstado(e.target.value)}
                      options={getNextStates(ticket.estado).map((s) => ({ value: s, label: ESTADOS_TICKET[s] }))}
                      placeholder="Seleccionar estado"
                    />
                  )}
                  {hasPermission(PERMISOS.ASIGNAR_TECNICO) && !ticket.asignado_a && (
                    <Select
                      label="Asignar Técnico"
                      value=""
                      onChange={(e) => handleAsignar(e.target.value)}
                      options={tecnicoOptions}
                      placeholder="Seleccionar técnico"
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Número</span>
                  <span className="font-medium text-gray-900 dark:text-white font-mono">{ticket.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Categoría</span>
                  <span className="font-medium text-gray-900 dark:text-white">{CATEGORIAS[ticket.categoria] || ticket.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <Badge variant="default">
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[ticket.estado]}`} />
                    {ESTADOS_TICKET[ticket.estado]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(ticket.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Comentarios</span>
                  <span className="font-medium text-gray-900 dark:text-white">{respuestas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Evidencias</span>
                  <span className="font-medium text-gray-900 dark:text-white">{ticket.evidencias?.length || 0}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
