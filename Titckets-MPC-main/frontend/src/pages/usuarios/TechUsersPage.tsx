import { useEffect, useState, useCallback, useMemo } from 'react'
import toast from '../../utils/notify'
import { Eye, X, Search, ChevronUp, ChevronDown, Headphones, Users } from 'lucide-react'
import { getUsuarios, getUsuario, getTecnicos } from '../../api/usuarioApi'
import Button from '../../components/ui/Button'
import Card, { CardBody } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Tooltip from '../../components/ui/Tooltip'
import SkeletonTable from '../../components/ui/SkeletonTable'
import LoadError from '../../components/ui/LoadError'
import useAuth from '../../hooks/useAuth'

type ModalMode = 'view' | null

export default function TechUsersPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol?.nombre === 'Administrador' || user?.rol_id === 1

  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('nombres')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        const [usuariosRes] = await Promise.all([
          getUsuarios({ per_page: 100 }),
        ])
        const allUsers = usuariosRes.data?.data || usuariosRes.data || []
        setUsuarios(allUsers.filter((u: any) => u.rol?.nombre === 'Tecnico'))
      } else {
        const res = await getTecnicos({ search: search || undefined })
        setUsuarios(res.data || [])
      }
      setLoadError(false)
    } catch { setLoadError(true) }
    finally { setLoading(false) }
  }, [isAdmin])

  useEffect(() => { loadData() }, [loadData])

  const filteredUsuarios = useMemo(() => {
    if (!isAdmin) return usuarios
    let result = [...usuarios]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((u: any) => `${u.nombres} ${u.apellidos}`.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
    }
    result.sort((a: any, b: any) => {
      let valA = a[sortField] || ''; let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [usuarios, search, sortField, sortDir, isAdmin])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`h-3 w-3 -mb-1 ${sortField === field && sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`} />
      <ChevronDown className={`h-3 w-3 -mt-1 ${sortField === field && sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`} />
    </span>
  )

  const openView = async (id: number) => {
    try {
      const res = await getUsuario(id)
      setSelectedUser(res.data)
      setModalMode('view')
    } catch { toast.error('Error al cargar técnico') }
  }

  const closeModal = () => { setModalMode(null); setSelectedUser(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Técnicos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAdmin ? 'Equipo de soporte técnico del sistema' : 'Visualiza el equipo de soporte técnico'}
          </p>
        </div>
      </div>

      <Card><CardBody>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all" />
            </div>
          </div>
        </div>
      </CardBody></Card>

      {loading ? <SkeletonTable rows={5} cols={isAdmin ? 5 : 4} /> : loadError ? (
        <Card><LoadError message="No se pudieron cargar los técnicos." onRetry={loadData} /></Card>
      ) : filteredUsuarios.length === 0 ? (
        <Card><div className="flex flex-col items-center justify-center py-16"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"><Users className="h-8 w-8 text-gray-400" /></div><h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay técnicos</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No se encontraron técnicos en el sistema</p></div></Card>
      ) : (
        <Card><Table>
          <TableHeader><TableRow>
            <TableHead><button onClick={() => handleSort('nombres')} className="flex items-center hover:text-gray-700 dark:hover:text-gray-300">Nombre <SortIcon field="nombres" /></button></TableHead>
            <TableHead><button onClick={() => handleSort('email')} className="flex items-center hover:text-gray-700 dark:hover:text-gray-300">Email <SortIcon field="email" /></button></TableHead>
            <TableHead>Área</TableHead>
            {isAdmin && <TableHead>Estado</TableHead>}
            <TableHead>Acciones</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredUsuarios.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                      {u.nombres?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{u.nombres} {u.apellidos}</span>
                      {u.is_self && <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">(Tú)</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">{u.email}</TableCell>
                <TableCell>
                  <Tooltip content={u.area?.nombre || 'Sin área'}>
                    <span className="block max-w-[140px] truncate text-sm text-gray-700 dark:text-gray-300">{u.area?.nombre || '—'}</span>
                  </Tooltip>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Badge variant={u.estado === 'activo' ? 'success' : 'danger'}>
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip content="Ver perfil">
                      <button onClick={() => openView(u.id)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}

      {/* Modal: Ver - Solo vista */}
      <Modal isOpen={modalMode === 'view'} onClose={closeModal} title="Detalle del Técnico" subtitle="Información del técnico de soporte" headerIcon={<Headphones className="h-5 w-5 text-blue-600" />} size="lg" footer={<Button variant="secondary" onClick={closeModal}><X className="h-4 w-4" /> Cerrar</Button>}>
        {selectedUser && <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-700/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white">{selectedUser.nombres?.charAt(0)?.toUpperCase()}</div>
            <div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.nombres} {selectedUser.apellidos}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-xs text-gray-500">Área:</span><p className="font-medium text-gray-900 dark:text-white">{selectedUser.area?.nombre || 'Sin área'}</p></div>
            {isAdmin && <div><span className="text-xs text-gray-500">Estado:</span><Badge variant={selectedUser.estado === 'activo' ? 'success' : 'danger'}>{selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge></div>}
            <div><span className="text-xs text-gray-500">Rol:</span><Badge variant="info">Tecnico</Badge></div>
          </div>
        </div>}
      </Modal>
    </div>
  )
}
