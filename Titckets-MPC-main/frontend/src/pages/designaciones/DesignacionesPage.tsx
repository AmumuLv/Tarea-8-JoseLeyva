import { useState, useEffect, useMemo } from 'react';
import { Link2, Plus, Search, Building2, AlertTriangle, X, Check, ArrowLeft, ChevronDown, User, Briefcase, Shield, Pencil, Loader2 } from 'lucide-react';
import { getDesignaciones, createDesignacion, updateDesignacion, finalizarDesignacion, getAreasDisponibles, getUsuariosDisponibles, getCargosDisponibles } from '../../api/designacionApi';
import DatePicker from '../../components/ui/DatePicker';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';
import { getErrorMessage } from '../../api/axios';

interface Designacion {
  id: number;
  area_id: number;
  usuario_id: number;
  cargo_id: number | null;
  tipo_designacion: string | null;
  observaciones: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado_asignacion: string;
  area: { id: number; nombre: string; correo: string; estado: string };
  usuario: { id: number; nombres: string; apellidos: string; dni: string; rol: { nombre: string } };
  cargo_relacion: { id: number; nombre: string } | null;
}

interface Area { id: number; nombre: string; descripcion: string; estado: string; }
interface Usuario { id: number; nombres: string; apellidos: string; dni: string; cargo: string; rol: { nombre: string } }
interface Cargo { id: number; nombre: string; unico?: boolean; disponible?: boolean; }

function getInitials(nombres?: string, apellidos?: string) {
  return `${(nombres?.[0] || '').toUpperCase()}${(apellidos?.[0] || '').toUpperCase()}`;
}

function parseLocalDate(dateStr: string): Date {
  const part = dateStr.substring(0, 10);
  const [y, m, d] = part.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(dateStr: string, locale: string = 'es-PE', opts?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(dateStr).toLocaleDateString(locale, opts);
}

export default function DesignacionesPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [finalizando, setFinalizando] = useState<Designacion | null>(null);
  const [editando, setEditando] = useState<Designacion | null>(null);
  const [editCargoId, setEditCargoId] = useState<number | null>(null);
  const [editUsuarioId, setEditUsuarioId] = useState<number | null>(null);
  const [editTipo, setEditTipo] = useState('');
  const [editObservaciones, setEditObservaciones] = useState('');
  const [editFechaInicio, setEditFechaInicio] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [areas, setAreas] = useState<Area[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [step, setStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [tipoDesignacion, setTipoDesignacion] = useState('Titular');
  const [saving, setSaving] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { loadDesignaciones(); }, [search]);

  const loadDesignaciones = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const res = await getDesignaciones(params);
      setDesignaciones(Array.isArray(res) ? res : res.data);
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  const loadFormData = async (excludeDesignacionId?: number) => {
    try {
      const [a, u, c] = await Promise.all([
        getAreasDisponibles(),
        getUsuariosDisponibles(excludeDesignacionId),
        getCargosDisponibles(excludeDesignacionId),
      ]);
      setAreas(a); setUsuarios(u); setCargos(c);
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const openForm = () => {
    setStep(1);
    setSelectedArea(null);
    setSelectedUsuario(null);
    setSelectedCargo(null);
    setTipoDesignacion('Titular');
    setAreaSearch('');
    setUsuarioSearch('');
    loadFormData();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedArea || !selectedUsuario || !selectedCargo) { toast.error('Completa todos los pasos'); return; }
    setSaving(true);
    try {
      await createDesignacion({
        area_id: selectedArea.id,
        usuario_id: selectedUsuario.id,
        cargo_id: selectedCargo.id,
        tipo_designacion: tipoDesignacion,
      });
      toast.success('Designación creada correctamente');
      setShowForm(false);
      loadDesignaciones();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally { setSaving(false); }
  };

  const handleFinalizar = async () => {
    if (!finalizando) return;
    try {
      await finalizarDesignacion(finalizando.id);
      toast.success('Designación finalizada');
      setFinalizando(null);
      loadDesignaciones();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const openEdit = (d: Designacion) => {
    setEditando(d);
    setEditUsuarioId(d.usuario?.id || null);
    setEditCargoId(d.cargo_relacion?.id || null);
    setEditTipo(d.tipo_designacion || 'Titular');
    setEditObservaciones(d.observaciones || '');
    setEditFechaInicio(d.fecha_inicio ? d.fecha_inicio.substring(0, 10) : '');
    loadFormData(d.id);
    setEditSaving(false);
  };

  const handleEditSave = async () => {
    if (!editando) return;
    setEditSaving(true);
    try {
      await updateDesignacion(editando.id, {
        usuario_id: editUsuarioId || undefined,
        cargo_id: editCargoId || undefined,
        tipo_designacion: editTipo || undefined,
        observaciones: editObservaciones,
        fecha_inicio: editFechaInicio || undefined,
      });
      toast.success('Designación actualizada');
      setEditando(null);
      loadDesignaciones();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally { setEditSaving(false); }
  };

  const filteredAreas = useMemo(() =>
    areas.filter(a => a.nombre.toLowerCase().includes(areaSearch.toLowerCase())),
    [areas, areaSearch]
  );

  const filteredUsuarios = useMemo(() =>
    usuarios.filter(u =>
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
      (u.dni && u.dni.includes(usuarioSearch))
    ),
    [usuarios, usuarioSearch]
  );

  const stepLabels = ['Área', 'Responsable', 'Cargo', 'Tipo', 'Confirmar'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Designaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de responsables por área</p>
        </div>
        <button onClick={openForm} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nueva Designación
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar por área o responsable..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto" /></div>
        ) : loadError ? (
          <LoadError message="No se pudieron cargar las designaciones." onRetry={loadDesignaciones} />
        ) : designaciones.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Link2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron designaciones activas</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Área</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Responsable</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cargo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {designaciones.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{d.area?.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">{getInitials(d.usuario?.nombres, d.usuario?.apellidos)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.usuario?.nombres} {d.usuario?.apellidos}</p>
                        <p className="text-[11px] text-gray-400">DNI: {d.usuario?.dni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{d.cargo_relacion?.nombre || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      d.tipo_designacion === 'Titular' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {d.tipo_designacion === 'Titular' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {d.tipo_designacion || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {d.fecha_inicio ? formatLocalDate(d.fecha_inicio, 'es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      d.estado_asignacion === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {d.estado_asignacion === 'activo' ? 'Activo' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} title="Editar"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setFinalizando(d)} title="Finalizar"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Designation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Nueva Designación</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Registra un nuevo responsable para un área</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 px-2">
                <div className="flex items-center gap-1.5">
                  {stepLabels.map((label, i) => (
                    <span key={i} className={`text-xs font-medium px-2 py-1 rounded-full ${i + 1 === step ? 'bg-purple-100 text-purple-700' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-8" style={{ scrollbarWidth: 'none' }}>
              {/* Active step card */}
              <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">

                {/* Step 1: Area */}
                {step === 1 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Seleccionar Área</span>
                    </div>
                    <input type="text" placeholder="Buscar área..." value={areaSearch} onChange={e => setAreaSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3" />
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {filteredAreas.map(a => (
                        <button key={a.id} onClick={() => { setSelectedArea(a); setStep(2); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            selectedArea?.id === a.id ? 'bg-purple-100 text-purple-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                          }`}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{a.nombre}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 2: Usuario */}
                {step === 2 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Responsable</span>
                    </div>
                    <input type="text" placeholder="Buscar por nombre o DNI..." value={usuarioSearch} onChange={e => setUsuarioSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3" />
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {filteredUsuarios.map(u => (
                        <button key={u.id} onClick={() => { setSelectedUsuario(u); setStep(3); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            selectedUsuario?.id === u.id ? 'bg-purple-100 text-purple-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-blue-700">{getInitials(u.nombres, u.apellidos)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{u.nombres} {u.apellidos}</p>
                              <p className="text-[11px] text-gray-400">DNI: {u.dni}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 3: Cargo */}
                {step === 3 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Cargo</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {cargos.map(c => {
                        const ocupado = !!c.unico && c.disponible === false;
                        return (
                          <button key={c.id} onClick={() => { if (ocupado) return; setSelectedCargo(c); setStep(4); }}
                            disabled={ocupado}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              ocupado ? 'opacity-50 cursor-not-allowed text-gray-400' :
                              selectedCargo?.id === c.id ? 'bg-purple-100 text-purple-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                            }`}>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              {c.nombre}{ocupado ? ' (en uso)' : ''}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Step 4: Tipo */}
                {step === 4 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Tipo de Designación</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { value: 'Titular', label: 'Titular', desc: 'Designación permanente como responsable del área', icon: Shield },
                        { value: 'Encargado', label: 'Encargado', desc: 'Designación temporal o por encargatura', icon: User },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => { setTipoDesignacion(opt.value); setStep(5); }}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            tipoDesignacion === opt.value ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <opt.icon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                              <p className="text-xs text-gray-400">{opt.desc}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 5: Confirmar */}
                {step === 5 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Confirmar Designación</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="h-9 w-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Área</p>
                          <p className="text-sm font-medium text-gray-900">{selectedArea?.nombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Responsable</p>
                          <p className="text-sm font-medium text-gray-900">{selectedUsuario?.nombres} {selectedUsuario?.apellidos}</p>
                          <p className="text-xs text-gray-500">DNI: {selectedUsuario?.dni}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="h-9 w-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cargo</p>
                          <p className="text-sm font-medium text-gray-900">{selectedCargo?.nombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tipo</p>
                          <p className="text-sm font-medium text-gray-900">{tipoDesignacion}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Fecha de inicio: <span className="font-medium">Hoy ({new Date().toLocaleDateString('es-PE')})</span>
                        {' | Se puede editar después'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => step > 1 ? setStep(step - 1) : setShowForm(false)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4" /> {step > 1 ? 'Anterior' : 'Cancelar'}
              </button>
              {step === 5 ? (
                <button onClick={handleSave} disabled={saving || !selectedArea || !selectedUsuario || !selectedCargo}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Guardar Designación
                </button>
              ) : (
                <button onClick={() => setStep(step + 1)} disabled={
                  (step === 1 && !selectedArea) || (step === 2 && !selectedUsuario) || (step === 3 && !selectedCargo)
                }
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors">
                  Siguiente <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Pencil className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Editar Designación</h3>
                <p className="text-xs text-gray-500">{editando.area?.nombre}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{getInitials(editando.usuario?.nombres, editando.usuario?.apellidos)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{editando.usuario?.nombres} {editando.usuario?.apellidos}</p>
                  <p className="text-[11px] text-gray-400">DNI: {editando.usuario?.dni}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Responsable</label>
                <select value={editUsuarioId || ''} onChange={e => setEditUsuarioId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sin cambio</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cargo</label>
                <select value={editCargoId || ''} onChange={e => setEditCargoId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sin cambio</option>
                  {cargos.map(c => (
                    <option key={c.id} value={c.id} disabled={c.unico && c.disponible === false}>
                      {c.nombre}{c.unico && c.disponible === false ? ' (en uso)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Designación</label>
                <div className="flex gap-2">
                  {['Titular', 'Encargado'].map(t => (
                    <button key={t} onClick={() => setEditTipo(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        editTipo === t ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                <DatePicker value={editFechaInicio} onChange={setEditFechaInicio} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observaciones</label>
                <textarea value={editObservaciones} onChange={e => setEditObservaciones(e.target.value.slice(0, 1000))}
                  rows={3} placeholder="Observaciones opcionales..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
              <button onClick={() => setEditando(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalizar Modal */}
      {finalizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Finalizar Designación</h3>
                <p className="text-xs text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700">{getInitials(finalizando.usuario?.nombres, finalizando.usuario?.apellidos)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{finalizando.usuario?.nombres} {finalizando.usuario?.apellidos}</p>
                  <p className="text-xs text-gray-500">{finalizando.area?.nombre}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">El área quedará sin responsable hasta que se asigne uno nuevo. La designación quedará registrada en el historial.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setFinalizando(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleFinalizar} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
