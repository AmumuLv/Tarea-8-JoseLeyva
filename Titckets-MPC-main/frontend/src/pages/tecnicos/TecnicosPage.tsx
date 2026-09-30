import { useEffect, useState, useCallback, useMemo } from 'react'
import toast from '../../utils/notify'
import { getErrorMessage } from '../../api/axios'
import {
  Search, Plus, Pencil, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, Headphones, UserCheck,
  Ticket, ToggleLeft, ToggleRight, Clock,
  History, CheckCircle2, Loader2, Mail, Key,
} from 'lucide-react'
import { getTecnicos, createTecnico, updateTecnico, deleteTecnico, toggleTecnicoEstado, getTecnicosStats, getTecnicoHistorial, getTecnicoStatsDetalle, resetTecnicoPassword } from '../../api/tecnicoApi'
import Button from '../../components/ui/Button'
import Card, { CardBody } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Tooltip from '../../components/ui/Tooltip'
import ConfirmModal from '../../components/ui/ConfirmModal'
import SkeletonTable from '../../components/ui/SkeletonTable'
import LoadError from '../../components/ui/LoadError'
import { formatDateTime, formatTimeAgo } from '../../utils/formatters'

type SortField = 'codigo' | 'alias' | 'nombres' | 'email' | 'tickets_activos_count' | 'estado'

const ACCION_ICONS: Record<string, any> = {
  inicio_sesion: { icon: '🔑', color: 'text-green-600 bg-green-50' },
  cierre_sesion: { icon: '🚪', color: 'text-gray-600 bg-gray-50' },
  creacion_ticket: { icon: '🎫', color: 'text-blue-600 bg-blue-50' },
  asignacion_ticket: { icon: '📋', color: 'text-purple-600 bg-purple-50' },
  cambio_estado: { icon: '🔄', color: 'text-amber-600 bg-amber-50' },
  intento_fallido: { icon: '❌', color: 'text-red-600 bg-red-50' },
  default: { icon: '📌', color: 'text-gray-600 bg-gray-50' },
}

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('codigo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [stats, setStats] = useState({ total: 0, disponibles: 0, tickets_activos: 0 })

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ autoAlias: true, alias: '', email: '', nombres: '', apellidos: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [detailItem, setDetailItem] = useState<any>(null)
  const [detailStats, setDetailStats] = useState<any>(null)
  const [detailHistorial, setDetailHistorial] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTab, setDetailTab] = useState<'info' | 'historial'>('info')

  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [tecnicosRes, statsRes] = await Promise.all([
        getTecnicos({ per_page: 100 }),
        getTecnicosStats(),
      ])
      setTecnicos(tecnicosRes.data?.data || [])
      setStats(statsRes.data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const nextAlias = useMemo(() => {
    const nums = tecnicos.map((t: any) => {
      const m = t.alias?.match(/Técnico\s+(\d+)/i)
      return m ? parseInt(m[1]) : 0
    })
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `Técnico ${max + 1}`
  }, [tecnicos])

  const nextEmail = useMemo(() => {
    const nums = tecnicos.map((t: any) => {
      const email = t.user?.email || ''
      const m = email.match(/tecnico(\d+)@/i)
      return m ? parseInt(m[1]) : 0
    })
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `tecnico${max + 1}@municasma.gob.pe`
  }, [tecnicos])

  const filteredTecnicos = useMemo(() => {
    let result = [...tecnicos]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((t: any) =>
        t.codigo?.toLowerCase().includes(s) ||
        t.alias?.toLowerCase().includes(s) ||
        t.nombres?.toLowerCase().includes(s) ||
        t.apellidos?.toLowerCase().includes(s) ||
        t.user?.email?.toLowerCase().includes(s)
      )
    }
    result.sort((a: any, b: any) => {
      let valA = a[sortField] ?? ''
      let valB = b[sortField] ?? ''
      if (sortField === 'email') {
        valA = a.user?.email ?? ''
        valB = b.user?.email ?? ''
      }
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [tecnicos, search, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`h-3 w-3 -mb-1 ${sortField === field && sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
      <ChevronDown className={`h-3 w-3 -mt-1 ${sortField === field && sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
    </span>
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ autoAlias: true, alias: nextAlias, email: nextEmail, nombres: '', apellidos: '', password: '' })
    setShowPassword(false)
    setShowModal(true)
  }

  const openEdit = (t: any) => {
    setEditing(t)
    setForm({
      autoAlias: false,
      alias: t.alias,
      email: t.user?.email || '',
      nombres: t.nombres || '',
      apellidos: t.apellidos || '',
      password: '',
    })
    setShowPassword(false)
    setShowModal(true)
  }

  const openDetail = async (t: any) => {
    setDetailItem(t)
    setDetailTab('info')
    setDetailLoading(true)
    try {
      const [statsRes, histRes] = await Promise.all([
        getTecnicoStatsDetalle(t.id),
        getTecnicoHistorial(t.id, { per_page: 50 }),
      ])
      setDetailStats(statsRes.data)
      setDetailHistorial(histRes.data?.data || [])
    } catch {
      setDetailStats(null)
      setDetailHistorial([])
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const payload: Record<string, any> = {
          nombres: form.nombres || null,
          apellidos: form.apellidos || null,
          email: form.email,
        }
        if (form.password) payload.password = form.password
        await updateTecnico(editing.id, payload)
        toast.success('Técnico actualizado correctamente')
      } else {
        await createTecnico({
          alias: form.autoAlias ? nextAlias : form.alias,
          email: form.email,
          password: form.password,
          nombres: form.nombres || null,
          apellidos: form.apellidos || null,
        })
        toast.success('Técnico creado correctamente')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTecnico(deleteId)
      toast.success('Técnico eliminado correctamente')
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleEstado = async (id: number) => {
    try {
      await toggleTecnicoEstado(id)
      toast.success('Estado actualizado')
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordId || !newPassword) return
    setResettingPassword(true)
    try {
      await resetTecnicoPassword(resetPasswordId, newPassword)
      toast.success('Contraseña restablecida correctamente')
      setShowResetPassword(false)
      setResetPasswordId(null)
      setNewPassword('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setResettingPassword(false)
    }
  }

  const getDisponibilidadBadge = (t: any) => {
    if (t.estado === 'inactivo') {
      return <Badge variant="danger"><span className="mr-1">🔴</span>Inactivo</Badge>
    }
    if (t.tickets_activos_count >= 5) {
      return <Badge variant="warning"><span className="mr-1">🟡</span>Ocupado</Badge>
    }
    if (t.tickets_activos_count > 0) {
      return <Badge variant="info"><span className="mr-1">🟡</span>Atendiendo</Badge>
    }
    return <Badge variant="success"><span className="mr-1">🟢</span>Disponible</Badge>
  }

  const getAccionIcon = (accion: string) => {
    return ACCION_ICONS[accion] || ACCION_ICONS.default
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Técnicos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Equipo de Soporte Técnico — OTIC</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo Técnico
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center dark:bg-blue-900/30">
              <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Técnicos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center dark:bg-green-900/30">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.disponibles}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center dark:bg-amber-900/30">
              <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tickets Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tickets_activos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, alias, nombre o correo..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
            />
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : loadError ? (
        <Card>
          <LoadError message="No se pudieron cargar los técnicos." onRetry={loadData} />
        </Card>
      ) : filteredTecnicos.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Headphones className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay técnicos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea el primer técnico del equipo de soporte</p>
            <Button onClick={openCreate} className="mt-4">
              <Plus className="h-4 w-4" /> Crear Técnico
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => handleSort('codigo')} className="flex items-center hover:text-gray-700">
                    Código <SortIcon field="codigo" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('alias')} className="flex items-center hover:text-gray-700">
                    Técnico <SortIcon field="alias" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('email')} className="flex items-center hover:text-gray-700">
                    Correo <SortIcon field="email" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('tickets_activos_count')} className="flex items-center hover:text-gray-700">
                    Tickets <SortIcon field="tickets_activos_count" />
                  </button>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTecnicos.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{t.codigo}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                        {t.alias?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.alias}</p>
                        {(t.nombres || t.apellidos) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.nombres} {t.apellidos}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.user?.email || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${
                      t.tickets_activos_count > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {t.tickets_activos_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getDisponibilidadBadge(t)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Ver detalle">
                        <button onClick={() => openDetail(t)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Editar">
                        <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Restablecer contraseña">
                        <button onClick={() => { setResetPasswordId(t.id); setNewPassword(''); setShowResetPassword(true) }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-700 transition-colors">
                          <Key className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content={t.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                        <button onClick={() => handleToggleEstado(t.id)} className={`rounded-lg p-1.5 transition-colors ${t.estado === 'activo' ? 'text-gray-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20' : 'text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'}`}>
                          {t.estado === 'activo' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar">
                        <button onClick={() => setDeleteId(t.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Técnico' : 'Nuevo Técnico'}
        subtitle={editing ? `Editando ${editing.codigo}` : 'Registrar nuevo miembro del equipo de soporte'}
        headerIcon={<Headphones className="h-5 w-5 text-blue-600" />}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Actualizar' : 'Crear Técnico'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-3 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-2">
                {form.autoAlias ? (
                  <ToggleRight className="h-6 w-6 text-blue-600 cursor-pointer" onClick={() => setForm({ ...form, autoAlias: false, alias: '' })} />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400 cursor-pointer" onClick={() => setForm({ ...form, autoAlias: true, alias: nextAlias, email: nextEmail })} />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Crear automáticamente</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Alias: <strong>{nextAlias}</strong></span>
            </div>
          )}

          {editing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alias</label>
              <input
                type="text"
                value={form.alias}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">El alias no se puede modificar</p>
            </div>
          ) : !form.autoAlias ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Alias <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.alias}
                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder="Ej: Técnico 1"
                required
              />
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Correo Institucional <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder="tecnicoX@municasma.gob.pe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nombres <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder="Nombres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Apellidos <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder="Apellidos"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Contraseña {editing ? '(dejar vacío para mantener)' : <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'}
                required={!editing}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailItem}
        onClose={() => { setDetailItem(null); setDetailStats(null); setDetailHistorial([]) }}
        title="Detalle del Técnico"
        subtitle={detailItem?.codigo}
        headerIcon={<Headphones className="h-5 w-5 text-blue-600" />}
        size="lg"
        footer={<Button variant="secondary" onClick={() => { setDetailItem(null); setDetailStats(null); setDetailHistorial([]) }}>Cerrar</Button>}
      >
        {detailItem && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                {detailItem.alias?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detailItem.alias}</h3>
                {detailItem.nombres || detailItem.apellidos ? (
                  <p className="text-sm text-gray-500">{detailItem.nombres} {detailItem.apellidos}</p>
                ) : null}
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" /> {detailItem.user?.email || '-'}
                </p>
                <div className="mt-1">{getDisponibilidadBadge(detailItem)}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <button
                  onClick={() => setDetailTab('info')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === 'info'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Información
                </button>
                <button
                  onClick={() => setDetailTab('historial')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === 'historial'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Historial
                </button>
              </div>
            </div>

            {/* Info Tab */}
            {detailTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5">Código</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{detailItem.codigo}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5">Correo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.user?.email || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5">Último Acceso</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {detailItem.ultimo_acceso ? formatTimeAgo(detailItem.ultimo_acceso) : 'Nunca'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5">Cuenta creada</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {detailItem.user?.created_at ? formatDateTime(detailItem.user.created_at) : '-'}
                    </p>
                  </div>
                </div>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : detailStats && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estadísticas de Tickets</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center dark:bg-blue-900/20 dark:border-blue-800">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{detailStats.tickets_asignados}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Asignados</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center dark:bg-amber-900/20 dark:border-amber-800">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{detailStats.tickets_en_proceso}</p>
                        <p className="text-xs text-gray-500 mt-0.5">En Proceso</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{detailStats.tickets_pendientes}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
                      </div>
                      <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center dark:bg-green-900/20 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{detailStats.tickets_resueltos}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Resueltos</p>
                      </div>
                      <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-center dark:bg-purple-900/20 dark:border-purple-800">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{detailStats.tickets_cerrados}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Cerrados</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{detailStats.tickets_total}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {detailTab === 'historial' && (
              <div className="space-y-4">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : detailHistorial.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <History className="h-8 w-8 mb-2" />
                    <p className="text-sm">No hay historial registrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-4">
                      {detailHistorial.map((h: any, idx: number) => {
                        const accionInfo = getAccionIcon(h.accion)
                        return (
                          <div key={h.id || idx} className="relative flex gap-4 pl-4">
                            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm ${accionInfo.color} flex-shrink-0`}>
                              {typeof accionInfo.icon === 'string' ? accionInfo.icon : <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0 pb-4">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {h.descripcion || h.accion}
                                </p>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {formatTimeAgo(h.created_at)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDateTime(h.created_at)}
                                </span>
                                {h.ticket?.numero && (
                                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Ticket className="h-3 w-3" />
                                    {h.ticket.numero}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPassword}
        onClose={() => { setShowResetPassword(false); setResetPasswordId(null); setNewPassword('') }}
        title="Restablecer Contraseña"
        subtitle="Ingrese la nueva contraseña para el técnico"
        headerIcon={<Key className="h-5 w-5 text-amber-600" />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowResetPassword(false); setResetPasswordId(null); setNewPassword('') }}>Cancelar</Button>
            <Button onClick={handleResetPassword} loading={resettingPassword}>
              Restablecer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Técnico"
        message="¿Estás seguro de eliminar este técnico? Se eliminará también su cuenta de usuario."
        confirmText="Eliminar"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
