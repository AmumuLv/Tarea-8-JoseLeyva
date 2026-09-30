import { useEffect, useState, useCallback } from 'react'
import { getAuditoria } from '../../api/auditApi'
import Card, { CardBody } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Loading from '../../components/ui/Loading'
import Pagination from '../../components/ui/Pagination'
import LoadError from '../../components/ui/LoadError'
import { formatDateTime } from '../../utils/formatters'

const accionLabels: Record<string, string> = {
  inicio_sesion: 'Inicio de sesión',
  cierre_sesion: 'Cierre de sesión',
  intento_fallido: 'Intento fallido',
  crear: 'Creación',
  actualizar: 'Edición',
  eliminar: 'Eliminación',
  finalizar: 'Finalización',
  creacion_usuario: 'Creación de usuario',
  edicion_usuario: 'Edición de usuario',
  creacion_area: 'Creación de área',
  edicion_area: 'Edición de área',
  creacion_ticket: 'Creación de ticket',
  edicion_ticket: 'Edición de ticket',
  cambio_estado_ticket: 'Cambio de estado',
  asignacion_tecnico: 'Asignación de técnico',
  cambio_jefe: 'Cambio de responsable',
  activacion: 'Activación',
  desactivacion: 'Desactivación',
  obtenerDatosDni: 'Consulta DNI',
}

const accionVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  inicio_sesion: 'success',
  cierre_sesion: 'default',
  intento_fallido: 'danger',
  crear: 'info',
  actualizar: 'warning',
  eliminar: 'danger',
  finalizar: 'warning',
  creacion_usuario: 'info',
  edicion_usuario: 'warning',
  creacion_area: 'info',
  edicion_area: 'warning',
  creacion_ticket: 'info',
  edicion_ticket: 'warning',
  cambio_estado_ticket: 'warning',
  asignacion_tecnico: 'info',
  cambio_jefe: 'warning',
  activacion: 'success',
  desactivacion: 'danger',
  obtenerDatosDni: 'default',
}

export default function AuditPage() {
  const [auditorias, setAuditorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadError, setLoadError] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: 50 }
      if (search) params.search = search
      const res = await getAuditoria(params)
      setAuditorias(res.data.data || [])
      setTotalPages(res.data.last_page || 1)
      setLoadError(false)
    } catch { setLoadError(true) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoría General</h1>
      </div>

      <Card>
        <CardBody>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Buscar en auditoría..."
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? <Loading /> : loadError ? (
        <Card><LoadError message="No se pudo cargar la auditoría." onRetry={loadData} /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditorias.length === 0 ? (
                <TableRow><TableCell><div className="py-8 text-center text-gray-500 dark:text-gray-400 col-span-6">No se encontraron registros</div></TableCell></TableRow>
              ) : auditorias.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateTime(a.created_at)}</TableCell>
                  <TableCell><Badge variant="default">{a.rol || '-'}</Badge></TableCell>
                  <TableCell className="max-w-[160px] truncate text-sm text-gray-600 dark:text-gray-400">{a.area || '-'}</TableCell>
                  <TableCell><Badge variant={accionVariants[a.accion] || 'default'}>{accionLabels[a.accion] || a.accion}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">{a.descripcion || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-500">{a.ip_address || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-6 pb-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </Card>
      )}
    </div>
  )
}
