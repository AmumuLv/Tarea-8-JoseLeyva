import { Fragment, useEffect, useState, useCallback } from 'react'
import toast from '../../utils/notify'
import { getErrorMessage, getValidationErrors } from '../../api/axios'
import {
  Plus, Search, X, RefreshCw, Download,
  ChevronUp, ChevronDown, FileText, Filter,
  Camera, MessageSquare
} from 'lucide-react'
import { getTickets, createTicket, uploadEvidencia, cambiarEstado } from '../../api/ticketApi'
import { getUsuarios } from '../../api/usuarioApi'
import { getAreas } from '../../api/areaApi'
import Button from '../../components/ui/Button'
import Card, { CardBody } from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'

import SkeletonTable from '../../components/ui/SkeletonTable'
import LoadError from '../../components/ui/LoadError'
import TicketDrawer from '../../components/tickets/TicketDrawer'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import RowActions from '../../components/tickets/RowActions'
import {
  ESTADOS_TICKET, ESTADO_DOT_COLOR,
  ESTADO_OPTIONS, CATEGORIA_OPTIONS
} from '../../utils/constants'
import { formatDate, formatElapsed } from '../../utils/formatters'
import useAuth from '../../hooks/useAuth'
import usePermission from '../../hooks/usePermission'
import { PERMISOS } from '../../utils/permissions'

type SortField = 'numero' | 'created_at' | 'estado' | 'titulo'

export default function TicketListPage() {
  const { user } = useAuth()
  const { hasPermission } = usePermission()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [categoria, setCategoria] = useState('')
  const [asignadoA, setAsignadoA] = useState('')
  const [areaId, setAreaId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [totalRecords, setTotalRecords] = useState(0)

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [_creating, setCreating] = useState(false)
  const [areas, setAreas] = useState<any[]>([])
  const [loadError, setLoadError] = useState(false)

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

  // Users
  const [usuarios, setUsuarios] = useState<any[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: perPage, sort_by: sortField, sort_dir: sortDir }
      if (search) params.search = search
      if (estado) params.estado = estado
      if (categoria) params.categoria = categoria
      if (asignadoA) params.asignado_a = asignadoA
      if (areaId) params.area_id = areaId
      if (fechaDesde) params.fecha_desde = fechaDesde
      if (fechaHasta) params.fecha_hasta = fechaHasta

      const ticketsRes = await getTickets(params)
      setTickets(ticketsRes.data.data || [])
      setTotalPages(ticketsRes.data.last_page || 1)
      setTotalRecords(ticketsRes.data.total || 0)
      setLoadError(false)
    } catch {
      setLoadError(true)
    } finally { setLoading(false) }
  }, [page, perPage, sortField, sortDir, search, estado, categoria, asignadoA, areaId, fechaDesde, fechaHasta])

  useEffect(() => { loadData() }, [loadData])

  const loadFilterData = async () => {
    const [areasRes, usuariosRes] = await Promise.allSettled([
      getAreas({ per_page: 100 }),
      getUsuarios({ per_page: 100 }),
    ])
    if (areasRes.status === 'fulfilled') {
      setAreas(areasRes.value.data.data || [])
    }
    if (usuariosRes.status === 'fulfilled') {
      setUsuarios(usuariosRes.value.data.data || [])
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`h-3 w-3 -mb-1 ${sortField === field && sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`} />
      <ChevronDown className={`h-3 w-3 -mt-1 ${sortField === field && sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`} />
    </span>
  )

  const clearFilters = () => {
    setSearch(''); setEstado(''); setCategoria('')
    setAsignadoA(''); setAreaId(''); setFechaDesde(''); setFechaHasta(''); setPage(1)
  }

  const hasActiveFilters = estado || categoria || asignadoA || areaId || fechaDesde || fechaHasta

  const openCreate = async () => {
    await loadFilterData()
    setShowCreate(true)
  }

  const handleCreateSubmit = async (data: { titulo: string; descripcion: string; categoria: string; incidencia: string; area_id?: number; files: File[] }) => {
    setCreating(true)
    try {
      const payload: Record<string, unknown> = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
      }
      if (data.area_id) {
        payload.area_id = data.area_id
      }
      const res = await createTicket(payload)
      const ticketId = res.data?.id

      if (ticketId && data.files.length > 0) {
        let fallidos = 0
        for (const file of data.files) {
          const fd = new FormData()
          fd.append('evidencia', file)
          fd.append('descripcion', '')
          try {
            await uploadEvidencia(ticketId, fd)
          } catch {
            fallidos++
          }
        }
        if (fallidos > 0) {
          toast.error(`${fallidos} archivo(s) de evidencia no se pudieron subir (solo JPG, JPEG, PNG, WEBP hasta 5MB)`)
        }
      }

      toast.success('Ticket creado exitosamente')
      setShowCreate(false)
      loadData()
    } catch (err) {
      const errors = getValidationErrors(err)
      if (!errors) toast.error(getErrorMessage(err))
      throw err
    } finally {
      setCreating(false)
    }
  }

  const openDetail = (id: number) => {
    setSelectedTicketId(id); setDrawerOpen(true)
  }

  const handleExport = (type: 'excel' | 'pdf') => {
    toast.success(`Exportando a ${type === 'excel' ? 'Excel' : 'PDF'}...`)
  }

  const tecnicoOptions = usuarios
    .filter((u: any) => u.rol?.nombre === 'Tecnico' || u.rol?.nombre === 'Administrador')
    .map((u: any) => ({ value: String(u.id), label: `${u.nombres} ${u.apellidos}` }))

  const areaOptions = areas.map((a: any) => ({ value: String(a.id), label: a.nombre }))

  const estadoBadgeColor: Record<string, string> = {
    pendiente: 'bg-gray-100 text-gray-700',
    asignado: 'bg-blue-100 text-blue-700',
    en_proceso: 'bg-amber-100 text-amber-700',
    en_espera: 'bg-purple-100 text-purple-700',
    resuelto: 'bg-emerald-100 text-emerald-700',
    cerrado: 'bg-gray-200 text-gray-600',
    cancelado: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de incidencias y soporte técnico</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadData} className="!px-3"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="secondary" onClick={() => handleExport('excel')}><Download className="h-4 w-4" /> Excel</Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}><Download className="h-4 w-4" /> PDF</Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo Ticket</Button>
        </div>
      </div>

      {/* Search & Controls */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por número, asunto, usuario u oficina..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
              />
            </div>
            <button
              onClick={() => { setShowFilters(!showFilters); if (!showFilters && areas.length === 0) loadFilterData() }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${hasActiveFilters ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              <Filter className="h-4 w-4" /> Filtros {hasActiveFilters && `(${[estado, categoria, asignadoA, areaId, fechaDesde, fechaHasta].filter(Boolean).length})`}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
              <Select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1) }} options={ESTADO_OPTIONS} placeholder="Estado" />
              <Select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPage(1) }} options={CATEGORIA_OPTIONS} placeholder="Categoría" />
              <Select value={asignadoA} onChange={(e) => { setAsignadoA(e.target.value); setPage(1) }} options={tecnicoOptions} placeholder="Técnico" />
              <Select value={areaId} onChange={(e) => { setAreaId(e.target.value); setPage(1) }} options={areaOptions} placeholder="Oficina" />
              <div className="flex gap-2">
                <input type="date" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPage(1) }} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" title="Desde" />
                <input type="date" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPage(1) }} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" title="Hasta" />
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <X className="h-3.5 w-3.5" /> Limpiar
                </button>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : loadError ? (
        <Card>
          <LoadError message="No se pudieron cargar los tickets." onRetry={loadData} />
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay tickets</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters || search ? 'No se encontraron tickets con los filtros aplicados' : 'Crea el primer ticket para comenzar'}
            </p>
            {(hasActiveFilters || search) && (
              <button onClick={clearFilters} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Limpiar filtros</button>
            )}
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('numero')} className="flex items-center hover:text-gray-600 transition-colors">
                      Número <SortIcon field="numero" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('titulo')} className="flex items-center hover:text-gray-600 transition-colors">
                      Asunto <SortIcon field="titulo" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Solicitante / Oficina</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Técnico</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('created_at')} className="flex items-center hover:text-gray-600 transition-colors">
                      Fecha <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {tickets.map((ticket: any, index: number) => {
                  const hasEvidencias = (ticket.evidencias?.length || 0) > 0
                  const hasRespuestas = (ticket.respuestas?.length || 0) > 0

                  return (
                    <Fragment key={ticket.id}>
                      <tr
                        onClick={() => openDetail(ticket.id)}
                        className={`group cursor-pointer transition-all duration-150 hover:bg-indigo-50/50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {/* Número */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-indigo-600">{ticket.numero}</span>
                        </td>

                        {/* Asunto */}
                        <td className="px-4 py-3.5 max-w-[250px]">
                          <p className="text-sm font-semibold text-gray-900 truncate">{ticket.titulo}</p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {hasEvidencias && (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-pink-50 px-1.5 py-0.5 text-[9px] font-medium text-pink-600">
                                <Camera className="h-2.5 w-2.5" />{ticket.evidencias.length}
                              </span>
                            )}
                            {hasRespuestas && (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-medium text-indigo-600">
                                <MessageSquare className="h-2.5 w-2.5" />{ticket.respuestas.length}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Solicitante / Oficina */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 flex-shrink-0">
                              {ticket.created_by?.nombres?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{ticket.created_by?.nombres || '—'} {ticket.created_by?.apellidos || ''}</p>
                              <p className="text-[11px] text-gray-500 truncate">{ticket.area?.nombre || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${estadoBadgeColor[ticket.estado] || 'bg-gray-100 text-gray-600'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT_COLOR[ticket.estado]}`} />
                            {ESTADOS_TICKET[ticket.estado]}
                          </span>
                        </td>

                        {/* Técnico */}
                        <td className="px-4 py-3.5">
                          {ticket.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 flex-shrink-0">
                                {ticket.assigned_to?.nombres?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-700 truncate max-w-[120px]">{ticket.assigned_to ? `${ticket.assigned_to.nombres} ${ticket.assigned_to.apellidos}` : ''}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(ticket.created_at)}</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500">{formatElapsed(ticket.created_at)}</span>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <RowActions
                              onCloseTicket={() => cambiarEstado(ticket.id, 'cerrado').then(() => { toast.success('Ticket cerrado'); loadData() }).catch((e: any) => toast.error(getErrorMessage(e)))}
                              onReopen={() => cambiarEstado(ticket.id, 'pendiente').then(() => { toast.success('Ticket reabierto'); loadData() }).catch((e: any) => toast.error(getErrorMessage(e)))}
                              isTerminal={ticket.estado === 'cerrado' || ticket.estado === 'cancelado'}
                            />
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Mostrar</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>registros</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{totalRecords} total</span>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <CreateTicketModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateSubmit}
        canSelectArea={hasPermission(PERMISOS.ASIGNAR_TECNICO)}
        isAreaUser={user?.rol?.nombre === 'Area Usuaria'}
        userAreaId={(user as any)?.area_id || (user as any)?.area?.id}
      />

      {/* Detail Drawer */}
      <TicketDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedTicketId(null) }}
        ticketId={selectedTicketId}
        currentUserId={user?.id}
        onRefresh={loadData}
      />
    </div>
  )
}
