import { useState, useEffect, useMemo } from 'react';
import { Link2, Plus, Search, Building2, Calendar, AlertTriangle, X, Check, ArrowLeft, Info, ChevronDown, Clock, UserX, CheckCircle2 } from 'lucide-react';
import { getAsignaciones, createAsignacion, finalizarAsignacion, getAreasDisponibles, getUsuariosDisponibles } from '../../api/asignacionApi';
import DatePicker from '../../components/ui/DatePicker';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';
import { getErrorMessage } from '../../api/axios';

interface Asignacion {
  id: number;
  area_id: number;
  usuario_id: number;
  cargo: string | null;
  observaciones: string | null;
  fecha_asignacion: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado_asignacion: string;
  activo: boolean;
  area: { id: number; nombre: string; correo: string; descripcion: string; estado: string };
  usuario: { id: number; nombres: string; apellidos: string; dni: string; cargo: string; estado: string; rol: { nombre: string } };
}

interface Area {
  id: number;
  nombre: string;
  correo: string;
  descripcion: string;
  estado: string;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  cargo: string;
  estado: string;
  rol: { nombre: string };
}

type ViewMode = 'list' | 'create' | 'finalizar';

const CARGOS = [
  'Jefe de Área',
  'Gerente',
  'Director',
  'Subgerente',
  'Coordinador',
  'Supervisor',
  'Asistente',
  'Auxiliar',
  'Analista',
  'Otro',
];

function todayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(dateStr: string): Date {
  const part = dateStr.substring(0, 10);
  const [y, m, d] = part.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(dateStr: string, locale: string = 'es-PE', opts?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(dateStr).toLocaleDateString(locale, opts);
}

function groupAreas(areas: Area[]) {
  const groups: Record<string, Area[]> = {
    Gerencias: [],
    'Oficinas Generales': [],
    Oficinas: [],
    Subgerencias: [],
    Otros: [],
  };

  areas.forEach(area => {
    const nombre = area.nombre.toLowerCase();
    if (nombre.startsWith('gerencia')) {
      groups.Gerencias.push(area);
    } else if (nombre.startsWith('oficina general')) {
      groups['Oficinas Generales'].push(area);
    } else if (nombre.startsWith('oficina')) {
      groups.Oficinas.push(area);
    } else if (nombre.startsWith('subgerencia')) {
      groups.Subgerencias.push(area);
    } else {
      groups.Otros.push(area);
    }
  });

  return Object.entries(groups).filter(([, areas]) => areas.length > 0);
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

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areasDisponibles, setAreasDisponibles] = useState<Area[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [finalizandoAsignacion, setFinalizandoAsignacion] = useState<Asignacion | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [areaSearch, setAreaSearch] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [cargo, setCargo] = useState('Jefe de Área');
  const [fechaInicio, setFechaInicio] = useState(todayLocal());
  const [observaciones, setObservaciones] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  const [fechaFin, setFechaFin] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  useEffect(() => {
    loadAsignaciones();
  }, [search, filterEstado]);

  const loadAsignaciones = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 100 };
      if (search) params.search = search;
      if (filterEstado) params.estado = filterEstado;
      const res = await getAsignaciones(params);
      setAsignaciones(res.data.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadDisponibles = async () => {
    try {
      const [areasRes, usuariosRes] = await Promise.all([
        getAreasDisponibles(),
        getUsuariosDisponibles(),
      ]);
      setAreasDisponibles(areasRes.data);
      setUsuariosDisponibles(usuariosRes.data);
    } catch {}
  };

  const openCreate = async () => {
    setSelectedArea(null);
    setSelectedUsuario(null);
    setCargo('Jefe de Área');
    setFechaInicio(todayLocal());
    setObservaciones('');
    setAreaSearch('');
    setUsuarioSearch('');
    setShowAllUsers(false);
    await loadDisponibles();
    setViewMode('create');
  };

  const openFinalizar = (asignacion: Asignacion) => {
    setFinalizandoAsignacion(asignacion);
    setFechaFin(todayLocal());
    setViewMode('finalizar');
  };

  const handleCreate = async () => {
    if (!selectedArea || !selectedUsuario) {
      toast.error('Selecciona un área y un usuario');
      return;
    }

    setSaving(true);
    try {
      await createAsignacion({
        area_id: selectedArea.id,
        usuario_id: selectedUsuario.id,
        cargo: cargo || null,
        observaciones: observaciones || null,
        fecha_inicio: fechaInicio,
      });
      toast.success('Asignación creada correctamente');
      setViewMode('list');
      loadAsignaciones();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = async () => {
    if (!finalizandoAsignacion || !fechaFin) {
      toast.error('Ingresa la fecha de fin de funciones');
      return;
    }

    setSaving(true);
    try {
      await finalizarAsignacion(finalizandoAsignacion.id, { fecha_fin: fechaFin });
      toast.success('Asignación finalizada correctamente');
      setViewMode('list');
      setFinalizandoAsignacion(null);
      loadAsignaciones();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const filteredAreas = useMemo(() => {
    if (!areaSearch) return groupAreas(areasDisponibles);
    const filtered = areasDisponibles.filter(a =>
      a.nombre.toLowerCase().includes(areaSearch.toLowerCase()) ||
      a.descripcion?.toLowerCase().includes(areaSearch.toLowerCase())
    );
    return groupAreas(filtered);
  }, [areasDisponibles, areaSearch]);

  const filteredUsuarios = useMemo(() => {
    const users = showAllUsers ? usuariosDisponibles : usuariosDisponibles.slice(0, 5);
    if (!usuarioSearch) return users;
    return usuariosDisponibles.filter(u =>
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
      u.dni?.includes(usuarioSearch)
    );
  }, [usuariosDisponibles, usuarioSearch, showAllUsers]);

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase();
  };

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Asignación</h1>
              <p className="text-sm text-gray-500 mt-1">Registra un nuevo responsable para un área.</p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a asignaciones
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">1. Seleccionar Área</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar área por nombre..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-4">
                {filteredAreas.map(([groupName, groupAreas]) => (
                  <div key={groupName}>
                    <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">{groupName}</h3>
                    <div className="space-y-1">
                      {groupAreas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => setSelectedArea(area)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${
                            selectedArea?.id === area.id
                              ? 'bg-purple-50 border-2 border-purple-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{area.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredAreas.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">No se encontraron áreas</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">2. Seleccionar Responsable</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={usuarioSearch}
                  onChange={(e) => setUsuarioSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="max-h-80 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {usuarioSearch ? 'Resultados' : 'Usuarios sugeridos'}
                </h3>
                <div className="space-y-2">
                  {filteredUsuarios.map((usuario) => (
                    <button
                      key={usuario.id}
                      onClick={() => setSelectedUsuario(usuario)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                        selectedUsuario?.id === usuario.id
                          ? 'bg-purple-50 border-2 border-purple-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                        selectedUsuario?.id === usuario.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getInitials(usuario.nombres, usuario.apellidos)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{usuario.nombres} {usuario.apellidos}</div>
                        <div className="text-xs text-gray-500">{usuario.cargo || 'Sin cargo asignado'}</div>
                      </div>
                    </button>
                  ))}
                  {filteredUsuarios.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">No se encontraron usuarios</div>
                  )}
                </div>
                {!usuarioSearch && !showAllUsers && usuariosDisponibles.length > 5 && (
                  <button
                    onClick={() => setShowAllUsers(true)}
                    className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Ver todos los usuarios
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">3. Cargo</label>
                <div className="relative">
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    {CARGOS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">4. Fecha de inicio</label>
                <DatePicker
                  value={fechaInicio}
                  onChange={(date) => setFechaInicio(date)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">5. Observaciones (opcional)</label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value.slice(0, 200))}
                  placeholder="Agrega alguna observación..."
                  maxLength={200}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Resumen de la asignación</h3>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-600">Área: <span className="font-medium text-gray-900">{selectedArea?.nombre || 'No seleccionada'}</span></span>
                  <span className="text-gray-600">Responsable: <span className="font-medium text-gray-900">{selectedUsuario ? `${selectedUsuario.nombres} ${selectedUsuario.apellidos}` : 'No seleccionado'}</span></span>
                  <span className="text-gray-600">Cargo: <span className="font-medium text-gray-900">{cargo}</span></span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-800">Solo puede haber un responsable activo por área.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>El responsable anterior deberá ser finalizado antes de asignar uno nuevo.</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !selectedArea || !selectedUsuario}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'finalizar' && finalizandoAsignacion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Asignación</h1>
              <p className="text-sm text-gray-500 mt-1">Registra la fecha de fin de funciones del responsable.</p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-700">
                  {getInitials(finalizandoAsignacion.usuario?.nombres, finalizandoAsignacion.usuario?.apellidos)}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{finalizandoAsignacion.usuario?.nombres} {finalizandoAsignacion.usuario?.apellidos}</h3>
                <p className="text-sm text-gray-500">{finalizandoAsignacion.area?.nombre} · {finalizandoAsignacion.cargo || 'Sin cargo'}</p>
              </div>
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Actualmente en funciones
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Fecha de inicio</p>
                <p className="text-sm font-medium text-gray-900">
                  {finalizandoAsignacion.fecha_inicio
                    ? formatLocalDate(finalizandoAsignacion.fecha_inicio, 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Duración</p>
                <p className="text-sm font-medium text-gray-900">
                  {finalizandoAsignacion.fecha_inicio ? calcDuration(finalizandoAsignacion.fecha_inicio, null) : '-'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Fecha de fin de funciones <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={fechaFin}
                onChange={(date) => setFechaFin(date)}
                min={finalizandoAsignacion.fecha_inicio || ''}
              />
              <p className="mt-1 text-xs text-gray-500">La fecha de fin debe ser igual o posterior a la fecha de inicio.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">¿Estás seguro de finalizar esta asignación?</p>
                <p>El registro se conservará en el historial. El área quedará sin responsable hasta que se asigne uno nuevo.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              onClick={handleFinalizar}
              disabled={saving || !fechaFin}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <UserX className="h-4 w-4" />
              {saving ? 'Finalizando...' : 'Finalizar Funciones'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
          <Plus className="h-4 w-4" />
          Nueva Asignación
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por área o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">Todas</option>
          <option value="activo">Activas</option>
          <option value="finalizado">Finalizadas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={6} className="p-0"><LoadError message="No se pudieron cargar las asignaciones." onRetry={loadAsignaciones} /></td></tr>
            ) : asignaciones.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron asignaciones</td></tr>
            ) : (
              asignaciones.map((asig) => (
                <tr key={asig.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{asig.area?.nombre}</div>
                        <div className="text-sm text-gray-500">{asig.area?.correo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {getInitials(asig.usuario?.nombres, asig.usuario?.apellidos)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{asig.usuario?.nombres} {asig.usuario?.apellidos}</div>
                        <div className="text-sm text-gray-500">{asig.cargo || 'Sin cargo'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {asig.fecha_inicio ? formatLocalDate(asig.fecha_inicio) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {asig.fecha_fin ? (
                        <>
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatLocalDate(asig.fecha_fin)}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {asig.estado_asignacion === 'activo' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Clock className="h-3 w-3" />
                        Actualmente en funciones
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Finalizado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {asig.estado_asignacion === 'activo' && (
                        <button
                          onClick={() => openFinalizar(asig)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Finalizar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
