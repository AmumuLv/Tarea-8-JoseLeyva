import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, Laptop, Printer, Keyboard, Mouse, Volume2, Wifi, Package, Plus,
  Search, Loader2, Eye, Pencil, Wrench, Clock, ChevronDown, ChevronRight,
  Building2, User, MapPin, Hash, Tag, AlertTriangle, FileText,
  Download, Printer as PrinterIcon, X, Landmark, Briefcase,
  Globe, Shield, Zap, Users, CircleCheck, XCircle,
} from 'lucide-react';
import type { Bien, TipoBien, BienStats } from '../../api/bienApi';
import { getBienes, getBienStats, getTiposBienes, getBienesPorArea } from '../../api/bienApi';
import { getSedes } from '../../api/sedesApi';
import usePermission from '../../hooks/usePermission';
import { PERMISOS } from '../../utils/permissions';
import { exportCsv } from '../../utils/exportCsv';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';

/* ─── Config ─── */

const TIPO_ICONOS: Record<string, any> = {
  'Computadora de Escritorio': Monitor, 'Laptop': Laptop, 'Impresora': Printer,
  'Monitor': Monitor, 'Teclado': Keyboard, 'Mouse': Mouse,
  'Parlantes': Volume2, 'Equipo de Red': Wifi, 'Otro': Package,
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  operativo: { label: 'Operativo', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  mantenimiento: { label: 'En Mantenimiento', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  programado: { label: 'Programado', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  inactivo: { label: 'Inactivo', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  baja: { label: 'Fuera de servicio', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-400' },
};

const AREA_ICONS = [Building2, Landmark, Briefcase, FileText, Globe, Shield, Zap, Users, Building2, Building2];

/* ─── Types ─── */

interface AreaData {
  id: number;
  nombre: string;
  correo: string;
  responsable: string | null;
  total: number;
  operativos: number;
  mantenimiento: number;
  programados: number;
  inactivos: number;
  baja: number;
}

/* ─── Component ─── */

export default function BienesPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISOS.EDITAR_BIEN) || hasPermission(PERMISOS.GESTIONAR_BIENES);

  const [areas, setAreas] = useState<AreaData[]>([]);
  const [stats, setStats] = useState<BienStats | null>(null);
  const [_tipos, setTipos] = useState<TipoBien[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
  const [sedeFilter, setSedeFilter] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<any>(null);

  const [expandedArea, setExpandedArea] = useState<number | null>(null);
  const [areaBienes, setAreaBienes] = useState<Record<number, Bien[]>>({});
  const [loadingArea, setLoadingArea] = useState<number | null>(null);

  const [drawerBien, setDrawerBien] = useState<Bien | null>(null);
  const [loadError, setLoadError] = useState(false);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  useEffect(() => { loadData(); }, [debouncedSearch]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setExpandedArea(null);
    setAreaBienes({});
    try {
      const areaParams: Record<string, any> = {};
      if (debouncedSearch) areaParams.search = debouncedSearch;

      const [areasRes, statsRes, tiposRes, sedesRes] = await Promise.all([
        getBienesPorArea(areaParams),
        getBienStats({}),
        getTiposBienes(),
        getSedes({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
      ]);
      const allAreas = (areasRes.data ?? areasRes) as AreaData[];
      setAreas(debouncedSearch ? allAreas.filter(a => {
        const nameMatch = a.nombre.toLowerCase().includes(debouncedSearch.toLowerCase());
        return nameMatch || a.total > 0;
      }) : allAreas);
      setStats((statsRes.data ?? statsRes) as BienStats);
      setTipos((tiposRes.data ?? tiposRes) as TipoBien[]);
      setSedes(((sedesRes.data as any)?.data ?? (sedesRes.data as any) ?? []) as { id: number; nombre: string }[]);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadAreaBienes = useCallback(async (areaId: number) => {
    setLoadingArea(areaId);
    try {
      const params: Record<string, any> = { area_id: areaId, per_page: 100 };
      if (sedeFilter) params.sede_id = sedeFilter;
      const res = await getBienes(params);
      const d = res.data ?? res;
      setAreaBienes(prev => ({ ...prev, [areaId]: d.data ?? d }));
    } catch {
      toast.error('Error al cargar bienes del área');
    } finally {
      setLoadingArea(null);
    }
  }, [sedeFilter]);

  useEffect(() => {
    if (expandedArea) loadAreaBienes(expandedArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeFilter]);

  const toggleArea = (areaId: number) => {
    if (expandedArea === areaId) {
      setExpandedArea(null);
    } else {
      setExpandedArea(areaId);
      if (!areaBienes[areaId]) loadAreaBienes(areaId);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params: Record<string, any> = { per_page: 1000 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (sedeFilter) params.sede_id = sedeFilter;
      const res = await getBienes(params);
      const d = res.data ?? res;
      const rows: Bien[] = d.data ?? d;
      exportCsv(
        'bienes-tecnologicos.csv',
        ['Código', 'Tipo', 'Marca', 'Modelo', 'N° Serie', 'Código Patrimonial', 'Estado', 'Área', 'Sede', 'Ubicación', 'Responsable', 'Registro'],
        rows.map(b => [
          b.codigo, getTypeName(b), b.marca, b.modelo, b.numero_serie, b.codigo_patrimonial,
          (ESTADO_CONFIG[b.estado] || ESTADO_CONFIG.operativo).label,
          (b as any).area?.nombre ?? '', b.sede?.nombre ?? '', b.ubicacion ?? '',
          (b as any).responsable_nombre ?? '',
          b.created_at ? new Date(b.created_at).toLocaleDateString('es-PE') : '',
        ]),
      );
      toast.success(`Reporte exportado (${rows.length} bienes)`);
    } catch {
      toast.error('Error al exportar el reporte');
    }
  };

  const getTypeName = (b: Bien) => (b as any).tipo_bien?.nombre || '—';
  const getTypeIcon = (b: Bien) => TIPO_ICONOS[getTypeName(b)] || Package;
  const getAreaIcon = (idx: number) => AREA_ICONS[idx % AREA_ICONS.length];

  const totalBienes = stats?.total ?? 0;
  const operativos = stats?.operativos ?? 0;
  const mantenimiento = stats?.mantenimiento ?? 0;
  const programados = stats?.programados ?? 0;
  const fueraServicio = (stats?.inactivos ?? 0) + (stats?.baja ?? 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bienes Tecnológicos</h1>
          <p className="text-sm text-gray-500 mt-1">Administración centralizada del inventario tecnológico por áreas.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total de bienes', value: totalBienes, icon: Package, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
            { label: 'Operativos', value: operativos, icon: CircleCheck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
            { label: 'Mantenimiento', value: mantenimiento, icon: Wrench, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
            { label: 'Programados', value: programados, icon: Clock, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-200' },
            { label: 'Fuera de servicio', value: fueraServicio, icon: XCircle, color: 'from-red-500 to-red-600', shadow: 'shadow-red-200' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[11px] text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar por código patrimonial, marca o modelo..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm" />
          </div>
          <select
            value={sedeFilter}
            onChange={e => setSedeFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            title="Filtrar bienes por sede">
            <option value="">Todas las sedes</option>
            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          {canManage && (
            <button onClick={() => navigate('/bienes/registrar')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Registrar bien
            </button>
          )}
          <button onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <PrinterIcon className="h-4 w-4" /> Imprimir
          </button>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Áreas registradas</h2>
          <span className="text-xs text-gray-400">{areas.length} áreas</span>
        </div>

        {/* Area Accordion Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <LoadError message="No se pudieron cargar los bienes." onRetry={loadData} />
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No se encontraron áreas con bienes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {areas.map((area, idx) => {
              const isExpanded = expandedArea === area.id;
              const isLoadingArea = loadingArea === area.id;
              const bienes = areaBienes[area.id] || [];
              const operativoPct = area.total > 0 ? Math.round((area.operativos / area.total) * 100) : 0;
              const AreaIcon = getAreaIcon(idx);

              return (
                <div key={area.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Area Header */}
                  <button onClick={() => toggleArea(area.id)}
                    className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-gray-50/50">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      idx % 3 === 0 ? 'bg-blue-100' : idx % 3 === 1 ? 'bg-emerald-100' : 'bg-purple-100'
                    }`}>
                      <AreaIcon className={`w-6 h-6 ${
                        idx % 3 === 0 ? 'text-blue-600' : idx % 3 === 1 ? 'text-emerald-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{area.nombre}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Responsable: <span className="text-gray-700">{area.responsable || 'Sin asignar'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden md:flex items-center gap-4 text-xs">
                        <span className="text-gray-500 font-medium">{area.total} equipos</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> {area.operativos}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> {area.mantenimiento}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> {area.programados}
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-red-400" /> {area.inactivos + area.baja}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="hidden lg:flex items-center gap-2 w-32">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${operativoPct}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 w-9 text-right">{operativoPct}%</span>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                        isExpanded ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Mobile stats row */}
                  <div className="md:hidden px-5 pb-3 flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{area.total} equipos</span>
                    <span className="text-emerald-600 font-semibold">🟢 {area.operativos}</span>
                    <span className="text-amber-600 font-semibold">🟡 {area.mantenimiento}</span>
                    <span className="text-blue-600 font-semibold">🔵 {area.programados}</span>
                    <span className="text-red-600 font-semibold">🔴 {area.inactivos + area.baja}</span>
                  </div>

                  {/* Expanded Table */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {isLoadingArea ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                      ) : bienes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hay bienes en esta área</p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-50">
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Código</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Tipo</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Marca</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Modelo</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Estado</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Responsable</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Sede</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Registro</th>
                                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bienes.map(bien => {
                                const TipoIcon = getTypeIcon(bien);
                                const estado = ESTADO_CONFIG[bien.estado] || ESTADO_CONFIG.operativo;
                                return (
                                  <tr key={bien.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                      <span className="text-sm font-semibold text-gray-900">{bien.codigo}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                          <TipoIcon className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <span className="text-xs text-gray-700">{getTypeName(bien)}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-700">{bien.marca || '—'}</td>
                                    <td className="px-5 py-3 text-xs text-gray-700">{bien.modelo || '—'}</td>
                                    <td className="px-5 py-3">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${estado.bg} ${estado.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                                        {estado.label}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                                      {(bien as any).responsable_nombre || '—'}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                                      {bien.sede?.nombre
                                        ? `${bien.sede.nombre}${bien.ubicacion ? ` · ${bien.ubicacion}` : ''}`
                                        : (bien.ubicacion || '—')}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-400">
                                      {new Date(bien.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-0.5">
                                        <button onClick={() => setDrawerBien(bien)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver información">
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        {canManage && (
                                          <button onClick={() => navigate(`/bienes/${bien.id}/editar`)}
                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {canManage && (
                                          <button onClick={() => navigate(`/bienes/${bien.id}?tab=mantenimientos`)}
                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Registrar mantenimiento">
                                            <Wrench className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <button onClick={() => navigate(`/bienes/${bien.id}`)}
                                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Ver historial">
                                          <Clock className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => toast.success('Ficha técnica próximamente')}
                                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Generar ficha técnica">
                                          <FileText className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {bienes.length > 5 && (
                            <div className="px-5 py-3 border-t border-gray-50">
                              <button onClick={() => navigate('/bienes/mi-area')}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                Ver todos los equipos de esta área <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Drawer ─── */}
      {drawerBien && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerBien(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slideInRight">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Detalle del Bien</h3>
              <button onClick={() => setDrawerBien(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-6">
              {/* Device header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  {(() => { const I = getTypeIcon(drawerBien); return <I className="w-8 h-8 text-white" />; })()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{drawerBien.codigo}</h4>
                  <p className="text-sm text-gray-500">{getTypeName(drawerBien)}</p>
                </div>
              </div>

              {/* Estado */}
              {(() => {
                const e = ESTADO_CONFIG[drawerBien.estado] || ESTADO_CONFIG.operativo;
                return (
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${e.bg}`}>
                    <span className={`w-3 h-3 rounded-full ${e.dot}`} />
                    <span className={`text-sm font-semibold ${e.color}`}>{e.label}</span>
                  </div>
                );
              })()}

              {/* Info */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h5>
                <div className="space-y-3">
                  {[
                    { icon: Tag, label: 'Marca', value: drawerBien.marca },
                    { icon: Tag, label: 'Modelo', value: drawerBien.modelo },
                    { icon: Hash, label: 'N° de Serie', value: drawerBien.numero_serie },
                    { icon: Hash, label: 'Código Patrimonial', value: drawerBien.codigo_patrimonial },
                    { icon: MapPin, label: 'Sede', value: drawerBien.sede?.nombre
                      ? `${drawerBien.sede.nombre}${drawerBien.ubicacion ? ` · ${drawerBien.ubicacion}` : ''}`
                      : (drawerBien.ubicacion || '—') },
                    { icon: Building2, label: 'Área', value: (drawerBien as any).area?.nombre },
                    { icon: User, label: 'Responsable', value: (drawerBien as any).responsable_nombre },
                  ].filter(f => f.value).map((field, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <field.icon className="w-3.5 h-3.5" />
                        {field.label}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Especificaciones */}
              {drawerBien.especificaciones && drawerBien.especificaciones.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Especificaciones</h5>
                  <div className="space-y-3">
                    {drawerBien.especificaciones.filter(e => e.valor).map((esp, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500 capitalize">{esp.campo.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-gray-800">{esp.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {drawerBien.observaciones && (
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Observaciones</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{drawerBien.observaciones}</p>
                </div>
              )}

              {/* Registro */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Registro</h5>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Registrado el {new Date(drawerBien.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => { setDrawerBien(null); navigate(`/bienes/${drawerBien.id}`); }}
                  className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> Ver página completa
                </button>
                <button onClick={() => toast.success('Función de reporte próximamente')}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-200">
                  <AlertTriangle className="w-4 h-4" /> Reportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
