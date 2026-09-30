import { useState, useEffect, useMemo } from 'react';
import { Building2, Plus, Pencil, Trash2, Search, Users, UserX, Ticket, Copy, History, Clock, Calendar, Eye, FileText, Monitor, Wrench, Download, Loader2 } from 'lucide-react';
import { getAreas, createArea, updateArea, deleteArea, getAreaStats, getArea, getAreaPdf } from '../../api/areaApi';
import { getAuditoria } from '../../api/auditApi';
import { getBienes } from '../../api/bienApi';
import type { Bien } from '../../api/bienApi';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';
import { getErrorMessage, getValidationErrors } from '../../api/axios';

interface AreaHistorial {
  id: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado_asignacion: string;
  cargo: string | null;
  usuario: { id: number; nombres: string; apellidos: string; dni: string };
}

interface Area {
  id: number;
  nombre: string;
  correo: string;
  password_correo: string;
  descripcion: string;
  estado: string;
  tickets_count: number;
  tickets?: Array<{
    id: number;
    numero: string;
    titulo: string;
    categoria: string;
    prioridad: string;
    estado: string;
    created_at: string;
    assigned_to?: { id: number; nombres: string; apellidos: string } | null;
    created_by?: { id: number; nombres: string; apellidos: string } | null;
  }>;
  asignaciones: Array<{
    id: number;
    usuario: { id: number; nombres: string; apellidos: string; cargo: string };
    fecha_inicio: string | null;
    estado_asignacion: string;
    cargo: string | null;
  }>;
  historial_responsables?: AreaHistorial[];
}

interface AreaStats {
  total: number;
  con_responsable: number;
  sin_responsable: number;
  tickets_activos: number;
}

type GroupFilter = 'todos' | 'gerencias' | 'oficinas_generales' | 'oficinas' | 'subgerencias' | 'otros';

function getGroup( nombre: string ): GroupFilter {
  const n = nombre.toLowerCase();
  if (n.startsWith('gerencia')) return 'gerencias';
  if (n.startsWith('oficina general')) return 'oficinas_generales';
  if (n.startsWith('oficina')) return 'oficinas';
  if (n.startsWith('subgerencia')) return 'subgerencias';
  return 'otros';
}

const FILTER_LABELS: Record<GroupFilter, string> = {
  todos: 'Todos',
  gerencias: 'Gerencias',
  oficinas_generales: 'Oficinas Generales',
  oficinas: 'Oficinas',
  subgerencias: 'Subgerencias',
  otros: 'Otros',
};

function parseLocalDate(dateStr: string): Date {
  const part = dateStr.substring(0, 10);
  const [y, m, d] = part.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(dateStr: string, locale: string = 'es-PE', opts?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(dateStr).toLocaleDateString(locale, opts);
}

function calcDuration(fechaInicio: string, fechaFin: string | null): string {
  const inicio = parseLocalDate(fechaInicio);
  const fin = fechaFin ? parseLocalDate(fechaFin) : new Date();
  const diffMs = fin.getTime() - inicio.getTime();
  if (diffMs < 0) return '-';
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dias < 30) return `${dias} día${dias !== 1 ? 's' : ''}`;
  const meses = Math.floor(dias / 30);
  const diasResto = dias % 30;
  if (meses < 12) return `${meses} mes${meses !== 1 ? 'es' : ''}${diasResto > 0 ? ` y ${diasResto} día${diasResto !== 1 ? 's' : ''}` : ''}`;
  const anios = Math.floor(meses / 12);
  const mesesResto = meses % 12;
  return `${anios} año${anios !== 1 ? 's' : ''}${mesesResto > 0 ? ` y ${mesesResto} mes${mesesResto !== 1 ? 'es' : ''}` : ''}`;
}

export default function AreaListPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [stats, setStats] = useState<AreaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<GroupFilter>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deletingArea, setDeletingArea] = useState<Area | null>(null);
  const [form, setForm] = useState({ nombre: '', correo: '', password_correo: '', descripcion: '', estado: 'activo' });
  const [saving, setSaving] = useState(false);

  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialArea, setHistorialArea] = useState<Area | null>(null);
  const [historialData, setHistorialData] = useState<AreaHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailArea, setDetailArea] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState('resumen');
  const [auditData, setAuditData] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [areaBienes, setAreaBienes] = useState<Bien[]>([]);
  const [loadingBienes, setLoadingBienes] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, statsRes] = await Promise.all([
        getAreas({ per_page: 100 }),
        getAreaStats(),
      ]);
      setAreas(areasRes.data.data);
      setStats(statsRes.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingArea(null);
    setForm({ nombre: '', correo: '', password_correo: '', descripcion: '', estado: 'activo' });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openEdit = (area: Area) => {
    setEditingArea(area);
    setForm({
      nombre: area.nombre,
      correo: area.correo || '',
      password_correo: area.password_correo || '',
      descripcion: area.descripcion || '',
      estado: area.estado,
    });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openHistorial = async (area: Area) => {
    setHistorialArea(area);
    setHistorialOpen(true);
    setLoadingHistorial(true);
    try {
      const res = await getArea(area.id);
      setHistorialData(res.data.historial_responsables || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingHistorial(false);
    }
  };

  const openDetail = async (area: Area) => {
    setDetailArea(area);
    setDetailOpen(true);
    setLoadingDetail(true);
    setDetailTab('resumen');
    setAreaBienes([]);
    try {
      const res = await getArea(area.id);
      setDetailArea(res.data);
      loadAuditData(area.id);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadAreaBienes = async (areaId: number) => {
    setLoadingBienes(true);
    try {
      const res = await getBienes({ area_id: areaId, per_page: 100 });
      const d = res.data ?? res;
      setAreaBienes(d.data ?? d);
    } catch {
      setAreaBienes([]);
    } finally {
      setLoadingBienes(false);
    }
  };

  useEffect(() => {
    if (detailOpen && detailTab === 'equipos' && detailArea) {
      loadAreaBienes(detailArea.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailTab, detailOpen]);

  const loadAuditData = async (areaId: number) => {
    setLoadingAudit(true);
    try {
      const res = await getAuditoria({ area_id: areaId, per_page: 50 });
      setAuditData(res.data.data || []);
    } catch {
      setAuditData([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!detailArea) return;
    setPdfLoading(true);
    try {
      const res = await getAreaPdf(detailArea.id);
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `REPORTE_AREA_${String(detailArea.nombre || 'area').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors(null);
    try {
      if (editingArea) {
        await updateArea(editingArea.id, form);
        toast.success('Área actualizada correctamente');
      } else {
        await createArea(form);
        toast.success('Área creada correctamente');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      const errors = getValidationErrors(err);
      setFieldErrors(errors);
      if (!errors) toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingArea) return;
    try {
      await deleteArea(deletingArea.id);
      toast.success('Área eliminada correctamente');
      setConfirmOpen(false);
      setDeletingArea(null);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Correo copiado');
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredAreas = useMemo(() => {
    let result = areas;

    if (activeFilter !== 'todos') {
      result = result.filter(a => getGroup(a.nombre) === activeFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.nombre.toLowerCase().includes(s) ||
        a.correo?.toLowerCase().includes(s) ||
        a.descripcion?.toLowerCase().includes(s) ||
        a.asignaciones?.some(asig =>
          `${asig.usuario?.nombres} ${asig.usuario?.apellidos}`.toLowerCase().includes(s)
        )
      );
    }

    return result;
  }, [areas, activeFilter, search]);

  const filterCounts = useMemo(() => {
    const counts: Record<GroupFilter, number> = { todos: areas.length, gerencias: 0, oficinas_generales: 0, oficinas: 0, subgerencias: 0, otros: 0 };
    areas.forEach(a => { counts[getGroup(a.nombre)]++; });
    return counts;
  }, [areas]);

  const filterButtons = (Object.keys(FILTER_LABELS) as GroupFilter[]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Áreas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona todas las áreas institucionales y sus responsables.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" />
          Registrar Área
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Áreas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              <p className="text-xs text-gray-400">Todas las áreas registradas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Con Responsable</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.con_responsable || 0}</p>
              <p className="text-xs text-gray-400">{stats?.total ? ((stats.con_responsable / stats.total) * 100).toFixed(1) : 0}% del total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <UserX className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sin Responsable</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.sin_responsable || 0}</p>
              <p className="text-xs text-gray-400">{stats?.total ? ((stats.sin_responsable / stats.total) * 100).toFixed(1) : 0}% del total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tickets Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.tickets_activos || 0}</p>
              <p className="text-xs text-gray-400">En todas las áreas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de área, correo o responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filterButtons.map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {FILTER_LABELS[key]}
            <span className={`ml-1.5 text-xs ${activeFilter === key ? 'text-blue-200' : 'text-gray-400'}`}>
              {filterCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[30%]">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[30%]">Correo Institucional</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">Tickets</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[15%]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={4} className="p-0"><LoadError message="No se pudieron cargar las áreas." onRetry={loadData} /></td></tr>
            ) : filteredAreas.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No se encontraron áreas</td></tr>
            ) : (
              filteredAreas.map((area) => {
                return (
                  <tr key={area.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{area.nombre}</div>
                          {area.descripcion && <div className="text-sm text-gray-500 truncate">{area.descripcion}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-gray-600 truncate">{area.correo || '-'}</span>
                        {area.correo && (
                          <button onClick={() => copyEmail(area.correo)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-medium ${
                        area.tickets_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {area.tickets_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(area)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openHistorial(area)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Historial de responsables"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(area)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setDeletingArea(area); setConfirmOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingArea ? 'Editar Área' : 'Registrar Área'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del área</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => { setForm({ ...form, nombre: e.target.value }); if (fieldErrors) setFieldErrors(null); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.nombre ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              required
            />
            {fieldErrors?.nombre && <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              value={form.correo}
              onChange={(e) => { setForm({ ...form, correo: e.target.value }); if (fieldErrors) setFieldErrors(null); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.correo ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="ejemplo@municasma.gob.pe"
            />
            {fieldErrors?.correo && <p className="mt-1 text-sm text-red-600">{fieldErrors.correo}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso {!editingArea && <span className="text-red-500">*</span>}</label>
            <input
              type="text"
              required={!editingArea}
              value={form.password_correo}
              onChange={(e) => { setForm({ ...form, password_correo: e.target.value }); if (fieldErrors) setFieldErrors(null); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.password_correo ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Contraseña para iniciar sesión"
            />
            {fieldErrors?.password_correo && <p className="mt-1 text-sm text-red-600">{fieldErrors.password_correo}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {editingArea
                ? 'Deja vacío para mantener la contraseña actual'
                : 'Se creará automáticamente la cuenta institucional del área'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : editingArea ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={historialOpen}
        onClose={() => setHistorialOpen(false)}
        title={`Historial de Responsables`}
        subtitle={historialArea?.nombre}
        size="lg"
      >
        {loadingHistorial ? (
          <div className="py-12 text-center text-gray-500">Cargando historial...</div>
        ) : historialData.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No hay registros de responsables para esta área.</div>
        ) : (
          <div className="space-y-4">
            {historialData.map((item, idx) => {
              const isActive = item.estado_asignacion === 'activo';
              return (
                <div key={item.id} className={`rounded-xl border p-4 ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <span className={`text-sm font-bold ${isActive ? 'text-green-700' : 'text-gray-600'}`}>
                          {getInitials(item.usuario?.nombres, item.usuario?.apellidos)}
                        </span>
                      </div>
                      {idx < historialData.length - 1 && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{item.usuario?.nombres} {item.usuario?.apellidos}</h4>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Clock className="h-3 w-3" />
                            Actualmente en funciones
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Finalizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Inicio: {item.fecha_inicio ? formatLocalDate(item.fecha_inicio, 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Fin: {item.fecha_fin ? formatLocalDate(item.fecha_fin, 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                        </span>
                        <span>Duración: {item.fecha_inicio ? calcDuration(item.fecha_inicio, item.fecha_fin) : '-'}</span>
                      </div>
                      {item.cargo && <p className="text-xs text-gray-400 mt-1">Cargo: {item.cargo}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detalle del Área"
        size="xl"
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-gray-500">Cargando...</div>
        ) : detailArea ? (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={handleDownloadPdf} disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm">
                {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Descargar PDF
              </button>
            </div>
            <div className="flex min-h-[480px]">
            {/* Sidebar */}
            <div className="w-52 flex-shrink-0 border-r border-gray-100 pr-4">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="h-11 w-11 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{detailArea.nombre}</h3>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    detailArea.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {detailArea.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <nav className="space-y-0.5">
                {[
                  { id: 'resumen', label: 'Resumen', icon: Eye },
                  { id: 'historial', label: 'Historial de Funcionarios', icon: History },
                  { id: 'tickets', label: 'Tickets Asociados', icon: Ticket, count: detailArea.tickets_count || 0 },
                  { id: 'auditoria', label: 'Auditoría', icon: Clock },
                  { id: 'documentos', label: 'Documentos', icon: FileText, soon: true },
                  { id: 'equipos', label: 'Equipos Asignados', icon: Monitor },
                  { id: 'servicios', label: 'Servicios Asociados', icon: Wrench, soon: true },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => !item.soon && setDetailTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      detailTab === item.id && !item.soon
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : item.soon
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left text-xs">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{item.count}</span>
                    )}
                    {item.soon && (
                      <span className="text-[9px] text-gray-300">Próximamente</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 pl-5 overflow-y-auto max-h-[460px]">
              {/* Resumen Tab */}
              {detailTab === 'resumen' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">Correo Institucional</p>
                      <p className="text-xs font-medium text-gray-900">{detailArea.correo || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">Tickets Asociados</p>
                      <p className="text-xs font-medium text-gray-900">{detailArea.tickets_count || 0} tickets</p>
                    </div>
                  </div>

                  {detailArea.descripcion && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">Descripción</p>
                      <p className="text-xs font-medium text-gray-900">{detailArea.descripcion}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">Estado</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        detailArea.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {detailArea.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">Fecha de Creación</p>
                      <p className="text-xs font-medium text-gray-900">{detailArea.created_at ? formatLocalDate(detailArea.created_at, 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Responsable Actual</h4>
                    {detailArea.asignaciones?.length > 0 && detailArea.asignaciones[0]?.estado_asignacion === 'activo' ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="h-9 w-9 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700">
                            {getInitials(detailArea.asignaciones[0].usuario?.nombres, detailArea.asignaciones[0].usuario?.apellidos)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{detailArea.asignaciones[0].usuario?.nombres} {detailArea.asignaciones[0].usuario?.apellidos}</p>
                          <p className="text-xs text-gray-500">{detailArea.asignaciones[0].cargo || 'Sin cargo'}</p>
                          {detailArea.asignaciones[0].tipo_designacion && (
                            <p className="text-[10px] text-blue-600 font-medium mt-0.5">{detailArea.asignaciones[0].tipo_designacion}</p>
                          )}
                          {detailArea.asignaciones[0].fecha_inicio && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Desde {formatLocalDate(detailArea.asignaciones[0].fecha_inicio, 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">Sin responsable asignado</p>
                    )}
                  </div>
                </div>
              )}

              {/* Historial Tab */}
              {detailTab === 'historial' && (
                <div className="space-y-3">
                  {detailArea.historial_responsables?.length > 0 ? (
                    detailArea.historial_responsables.map((h: any, i: number) => (
                      <div key={i} className={`rounded-lg border p-3 ${
                        h.estado_asignacion === 'activo' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            h.estado_asignacion === 'activo' ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <span className={`text-xs font-bold ${
                              h.estado_asignacion === 'activo' ? 'text-green-700' : 'text-gray-500'
                            }`}>
                              {getInitials(h.usuario?.nombres, h.usuario?.apellidos)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{h.usuario?.nombres} {h.usuario?.apellidos}</p>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                h.estado_asignacion === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {h.estado_asignacion === 'activo' ? 'Actual' : 'Finalizado'}
                              </span>
                            </div>
                            {h.cargo && <p className="text-xs text-gray-600 mt-0.5">{h.cargo}</p>}
                            {h.tipo_designacion && (
                              <p className="text-[10px] text-blue-600 font-medium mt-0.5">{h.tipo_designacion}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                              <span>Inicio: {h.fecha_inicio ? formatLocalDate(h.fecha_inicio, 'es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                              <span>Fin: {h.fecha_fin ? formatLocalDate(h.fecha_fin, 'es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                              {h.fecha_inicio && <span className="text-gray-500">({calcDuration(h.fecha_inicio, h.fecha_fin)})</span>}
                            </div>
                            {h.observaciones && (
                              <p className="text-[10px] text-gray-400 mt-1 italic">{h.observaciones}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : detailArea.asignaciones?.length > 0 ? (
                    detailArea.asignaciones.map((a: any, i: number) => (
                      <div key={i} className={`rounded-lg border p-3 ${
                        a.estado_asignacion === 'activo' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            a.estado_asignacion === 'activo' ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <span className={`text-xs font-bold ${
                              a.estado_asignacion === 'activo' ? 'text-green-700' : 'text-gray-500'
                            }`}>
                              {getInitials(a.usuario?.nombres, a.usuario?.apellidos)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{a.usuario?.nombres} {a.usuario?.apellidos}</p>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                a.estado_asignacion === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {a.estado_asignacion === 'activo' ? 'Actual' : 'Finalizado'}
                              </span>
                            </div>
                            {a.cargo && <p className="text-xs text-gray-600 mt-0.5">{a.cargo}</p>}
                            {a.tipo_designacion && (
                              <p className="text-[10px] text-blue-600 font-medium mt-0.5">{a.tipo_designacion}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                              <span>Inicio: {a.fecha_inicio ? formatLocalDate(a.fecha_inicio, 'es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                              <span>Fin: {a.fecha_fin ? formatLocalDate(a.fecha_fin, 'es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                              {a.fecha_inicio && <span className="text-gray-500">({calcDuration(a.fecha_inicio, a.fecha_fin)})</span>}
                            </div>
                            {a.observaciones && (
                              <p className="text-[10px] text-gray-400 mt-1 italic">{a.observaciones}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">Sin historial de funcionarios</p>
                  )}
                </div>
              )}

              {/* Tickets Tab */}
              {detailTab === 'tickets' && (
                <div className="space-y-2">
                  {detailArea.tickets && detailArea.tickets.length > 0 ? (
                    detailArea.tickets.map((ticket: any) => (
                      <div key={ticket.id} className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          ticket.estado === 'pendiente' ? 'bg-gray-100' :
                          ticket.estado === 'asignado' ? 'bg-blue-100' :
                          ticket.estado === 'en_proceso' ? 'bg-yellow-100' :
                          ticket.estado === 'resuelto' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <Ticket className={`h-4 w-4 ${
                            ticket.estado === 'pendiente' ? 'text-gray-500' :
                            ticket.estado === 'asignado' ? 'text-blue-600' :
                            ticket.estado === 'en_proceso' ? 'text-yellow-600' :
                            ticket.estado === 'resuelto' ? 'text-green-600' :
                            'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-400">{ticket.numero}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                              ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                              ticket.estado === 'asignado' ? 'bg-blue-100 text-blue-700' :
                              ticket.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' :
                              ticket.estado === 'resuelto' ? 'bg-green-100 text-green-700' :
                              ticket.estado === 'cerrado' ? 'bg-gray-200 text-gray-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {ticket.estado === 'pendiente' ? 'Nuevo' :
                               ticket.estado === 'asignado' ? 'Asignado' :
                               ticket.estado === 'en_proceso' ? 'En Proceso' :
                               ticket.estado === 'resuelto' ? 'Resuelto' :
                               ticket.estado === 'cerrado' ? 'Cerrado' :
                               ticket.estado}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 truncate mt-0.5">{ticket.titulo}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                            <span>{ticket.categoria}</span>
                            {ticket.assigned_to && (
                              <span>→ {ticket.assigned_to.nombres} {ticket.assigned_to.apellidos}</span>
                            )}
                            <span>{new Date(ticket.created_at).toLocaleDateString('es-PE')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Ticket className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">Sin tickets asociados</p>
                    </div>
                  )}
                </div>
              )}

              {/* Auditoría Tab */}
              {detailTab === 'auditoria' && (
                <div className="space-y-3">
                  {loadingAudit ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2" />
                      <p className="text-xs">Cargando auditoría...</p>
                    </div>
                  ) : auditData.length > 0 ? (
                    auditData.map((audit: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          audit.accion === 'crear' ? 'bg-green-100' :
                          audit.accion === 'actualizar' ? 'bg-blue-100' :
                          'bg-red-100'
                        }`}>
                          <span className={`text-[10px] font-bold ${
                            audit.accion === 'crear' ? 'text-green-700' :
                            audit.accion === 'actualizar' ? 'text-blue-700' :
                            'text-red-700'
                          }`}>
                            {audit.accion === 'crear' ? 'CR' : audit.accion === 'actualizar' ? 'AC' : 'EL'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{audit.descripcion || audit.accion}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                            <span>{audit.user?.nombres} {audit.user?.apellidos}</span>
                            <span>{audit.rol}</span>
                            <span>{audit.created_at ? new Date(audit.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          {audit.ip_address && (
                            <p className="text-[10px] text-gray-300 mt-0.5">IP: {audit.ip_address}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">Sin registros de auditoría</p>
                    </div>
                  )}
                </div>
              )}

              {/* Equipos Asignados Tab */}
              {detailTab === 'equipos' && (
                <div className="space-y-3">
                  {loadingBienes ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-purple-600 rounded-full mx-auto mb-2" />
                      <p className="text-xs">Cargando equipos...</p>
                    </div>
                  ) : areaBienes.length > 0 ? (
                    areaBienes.map(b => {
                      const estadoCfg: Record<string, { label: string; cls: string }> = {
                        operativo: { label: 'Operativo', cls: 'bg-green-100 text-green-700' },
                        mantenimiento: { label: 'Mantenimiento', cls: 'bg-amber-100 text-amber-700' },
                        inactivo: { label: 'Inactivo', cls: 'bg-red-100 text-red-700' },
                        baja: { label: 'Baja', cls: 'bg-gray-100 text-gray-600' },
                      };
                      const est = estadoCfg[b.estado] || estadoCfg.operativo;
                      const tipoNombre = (b as any).tipo_bien?.nombre || 'Bien';
                      const sedeNombre = (b as any).sede?.nombre;
                      return (
                        <div key={b.id} className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-100 p-3">
                          <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Monitor className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">{b.codigo}</p>
                              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${est.cls}`}>{est.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {tipoNombre}{b.marca ? ` · ${b.marca}` : ''}{b.modelo ? ` ${b.modelo}` : ''}
                              {sedeNombre ? ` · ${sedeNombre}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">Sin equipos asignados</p>
                    </div>
                  )}
                </div>
              )}

              {/* Próximamente tabs */}
              {['documentos', 'equipos', 'servicios'].includes(detailTab) && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    {detailTab === 'documentos' && <FileText className="h-6 w-6 text-gray-300" />}
                    {detailTab === 'equipos' && <Monitor className="h-6 w-6 text-gray-300" />}
                    {detailTab === 'servicios' && <Wrench className="h-6 w-6 text-gray-300" />}
                  </div>
                  <p className="text-sm font-medium text-gray-500">Próximamente</p>
                  <p className="text-xs text-gray-400 mt-1">Estamos trabajando en ello</p>
                </div>
              )}
            </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Área"
        message={`¿Estás seguro de eliminar el área "${deletingArea?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
