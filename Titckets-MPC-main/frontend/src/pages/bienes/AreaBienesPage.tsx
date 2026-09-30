import { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, Eye, AlertTriangle, Package, Building2, User, Calendar,
  MapPin, Tag, Hash, Monitor, Laptop, Printer, Keyboard, Mouse, Volume2, Wifi,
  ChevronLeft, ChevronRight, X, Info, Clock, CircleCheck, Wrench,
  FileText, Cpu, HardDrive, MemoryStick, Globe, Network,
  Palette, Layers, Download,
} from 'lucide-react';
import type { Bien, TipoBien, BienStats } from '../../api/bienApi';
import { getBienes, getBienStats, getTiposBienes } from '../../api/bienApi';
import { getAreaProfile } from '../../api/areaProfileApi';
import { exportCsv } from '../../utils/exportCsv';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';

const TIPO_ICONOS: Record<string, any> = {
  'Computadora de Escritorio': Monitor,
  'Laptop': Laptop,
  'Impresora': Printer,
  'Monitor': Monitor,
  'Teclado': Keyboard,
  'Mouse': Mouse,
  'Parlantes': Volume2,
  'Equipo de Red': Wifi,
  'Otro': Package,
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  operativo: { label: 'Operativo', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  mantenimiento: { label: 'En Mantenimiento', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  inactivo: { label: 'Inactivo', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  baja: { label: 'Baja', color: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-400' },
};

const SPEC_ICON_MAP: Record<string, any> = {
  procesador: Cpu, memoria_ram: MemoryStick, tipo_ram: Layers, almacenamiento: HardDrive,
  tipo_almacenamiento: HardDrive, sistema_operativo: Globe, direccion_ip: Network,
  direccion_mac: Network, nombre_equipo: Monitor, tarjeta_grafica: Palette,
  placa_madre: Layers, modelo: Tag, marca: Tag, numero_serie: Hash,
  codigo_patrimonial: Hash, ubicacion: MapPin, observaciones: FileText,
};

export default function AreaBienesPage() {
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [stats, setStats] = useState<BienStats | null>(null);
  const [tipos, setTipos] = useState<TipoBien[]>([]);
  const [areaProfile, setAreaProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [drawerBien, setDrawerBien] = useState<Bien | null>(null);
  const [, setDrawerLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, filterEstado, filterTipo, page]);

  useEffect(() => {
    getAreaProfile().then(r => setAreaProfile(r.data)).catch(() => {});
    getTiposBienes().then(r => setTipos(r.data ?? r)).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 12 };
      if (search) params.search = search;
      if (filterEstado) params.estado = filterEstado;
      if (filterTipo) params.tipo_bien_id = filterTipo;
      const [bienesRes, statsRes] = await Promise.all([
        getBienes(params),
        getBienStats(),
      ]);
      const bData = bienesRes.data ?? bienesRes;
      setBienes(bData.data ?? bData);
      setLastPage(bData.last_page ?? 1);
      setTotal(bData.total ?? 0);
      setStats(statsRes.data ?? statsRes);
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  const areaNombre = areaProfile?.area?.nombre || 'Mi Área';
  const responsable = areaProfile?.responsable;
  const responsableNombre = responsable ? `${responsable.nombres} ${responsable.apellidos}` : '—';
  const fechaActualizacion = useMemo(() => {
    if (!bienes.length) return '—';
    const latest = bienes.reduce((max, b) => {
      const d = new Date(b.created_at);
      return d > max ? d : max;
    }, new Date(0));
    return latest.getTime() > 0 ? latest.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  }, [bienes]);

  const totalBienes = stats?.total ?? 0;
  const operativos = stats?.operativos ?? 0;
  const mantenimiento = stats?.mantenimiento ?? 0;

  const getTypeName = (b: Bien) => (b as any).tipo_bien?.nombre || '—';
  const getTypeIcon = (b: Bien) => TIPO_ICONOS[getTypeName(b)] || Package;

  const handleExportCsv = async () => {
    try {
      const params: Record<string, any> = { per_page: 1000 };
      if (search) params.search = search;
      if (filterEstado) params.estado = filterEstado;
      if (filterTipo) params.tipo_bien_id = filterTipo;
      const res = await getBienes(params);
      const d = res.data ?? res;
      const rows: Bien[] = d.data ?? d;
      exportCsv(
        'bienes-mi-area.csv',
        ['Código', 'Tipo', 'Marca', 'Modelo', 'N° Serie', 'Código Patrimonial', 'Estado', 'Sede', 'Ubicación', 'Registro'],
        rows.map(b => [
          b.codigo, getTypeName(b), b.marca, b.modelo, b.numero_serie, b.codigo_patrimonial,
          (ESTADO_CONFIG[b.estado] || ESTADO_CONFIG.operativo).label,
          b.sede?.nombre ?? '', b.ubicacion ?? '',
          b.created_at ? new Date(b.created_at).toLocaleDateString('es-PE') : '',
        ]),
      );
      toast.success(`Reporte exportado (${rows.length} bienes)`);
    } catch {
      toast.error('Error al exportar el reporte');
    }
  };

  const openDrawer = async (bien: Bien) => {
    setDrawerBien(bien);
    setDrawerLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienes Tecnológicos del Área</h1>
          <p className="text-sm text-gray-500 mt-1">Consulta el inventario de equipos asignados a <span className="font-medium text-gray-700">{areaNombre}</span>.</p>
        </div>

        {/* Area Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{areaNombre}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {responsableNombre}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {totalBienes} bienes registrados
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Actualizado: {fechaActualizacion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total de Bienes', value: totalBienes, icon: Package, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
            { label: 'Equipos Operativos', value: operativos, icon: CircleCheck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
            { label: 'En Mantenimiento', value: mantenimiento, icon: Wrench, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por código patrimonial, marca o modelo..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm" />
          </div>
          <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm">
            <option value="">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="inactivo">Inactivo</option>
            <option value="baja">Baja</option>
          </select>
          <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm">
            <option value="">Todos los tipos</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <button onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Código</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Tipo</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Marca</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Modelo</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Sede</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Registro</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                </td></tr>
              ) : loadError ? (
                <tr><td colSpan={8} className="p-0"><LoadError message="No se pudieron cargar los bienes." onRetry={loadData} /></td></tr>
              ) : bienes.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No se encontraron bienes</p>
                </td></tr>
              ) : bienes.map(bien => {
                const TipoIcon = getTypeIcon(bien);
                const estado = ESTADO_CONFIG[bien.estado] || ESTADO_CONFIG.operativo;
                return (
                  <tr key={bien.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{bien.codigo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <TipoIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{getTypeName(bien)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{bien.marca || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{bien.modelo || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {(bien as any).sede?.nombre
                        ? `${(bien as any).sede.nombre}${bien.ubicacion ? ` · ${bien.ubicacion}` : ''}`
                        : (bien.ubicacion || '—')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(bien.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDrawer(bien)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => toast.success('Función de reporte próximamente')}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reportar incidencia">
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Mostrando {bienes.length} de {total} bienes</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1).filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1).map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-gray-300">...</span>}
                    <button onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}>{p}</button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Drawer ─── */}
      {drawerBien && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerBien(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slideInRight">
            {/* Drawer Header */}
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
              <div className={`flex items-center gap-3 p-4 rounded-xl ${ESTADO_CONFIG[drawerBien.estado]?.bg || 'bg-gray-50'}`}>
                <span className={`w-3 h-3 rounded-full ${ESTADO_CONFIG[drawerBien.estado]?.dot || 'bg-gray-400'}`} />
                <span className={`text-sm font-semibold ${ESTADO_CONFIG[drawerBien.estado]?.color || 'text-gray-600'}`}>
                  {ESTADO_CONFIG[drawerBien.estado]?.label || drawerBien.estado}
                </span>
              </div>

              {/* Información técnica */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información Técnica</h5>
                <div className="space-y-3">
                  {[
                    { icon: Tag, label: 'Marca', value: drawerBien.marca },
                    { icon: Tag, label: 'Modelo', value: drawerBien.modelo },
                    { icon: Hash, label: 'N° de Serie', value: drawerBien.numero_serie },
                    { icon: Hash, label: 'Código Patrimonial', value: drawerBien.codigo_patrimonial },
                    { icon: MapPin, label: 'Sede', value: (drawerBien as any).sede?.nombre
                      ? `${(drawerBien as any).sede.nombre}${drawerBien.ubicacion ? ` · ${drawerBien.ubicacion}` : ''}`
                      : (drawerBien.ubicacion || '—') },
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
                    {drawerBien.especificaciones.filter(e => e.valor).map((esp, i) => {
                      const SpecIcon = SPEC_ICON_MAP[esp.campo] || Info;
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <SpecIcon className="w-3.5 h-3.5" />
                            <span className="capitalize">{esp.campo.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{esp.valor}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Responsable */}
              {(drawerBien as any).responsable_nombre && (
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Responsable</h5>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{(drawerBien as any).responsable_nombre}</p>
                      <p className="text-xs text-gray-500">{(drawerBien as any).responsable_cargo || 'Responsable de área'}</p>
                    </div>
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

              {/* Botón Reportar */}
              <button onClick={() => toast.success('Función de reporte próximamente')}
                className="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-200">
                <AlertTriangle className="w-4 h-4" />
                Reportar Problema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
