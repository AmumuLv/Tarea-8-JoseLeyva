import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Monitor, Laptop, Printer, Keyboard, Mouse, Volume2, Wifi, Package,
  Loader2, Plus, User, MapPin, Tag, Hash, Pencil,
  CircleCheck, Wrench, Trash2, Clock
} from 'lucide-react';
import type { Bien, Mantenimiento, BienHistorial } from '../../api/bienApi';
import { getBien, getBienHistorial, getMantenimientos, createMantenimiento, cambiarEstadoBien, deleteBien } from '../../api/bienApi';
import toast from '../../utils/notify';
import { getErrorMessage } from '../../api/axios';
import usePermission from '../../hooks/usePermission';
import { PERMISOS } from '../../utils/permissions';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const TIPO_ICONOS: Record<string, any> = {
  Monitor, Laptop, Printer, Keyboard, Mouse, Volume2, Wifi, Package,
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  operativo: { label: 'Operativo', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  mantenimiento: { label: 'En Mantenimiento', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  inactivo: { label: 'Inactivo', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  baja: { label: 'Baja', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-500' },
};

const EVENTO_COLORS: Record<string, string> = {
  creacion: 'bg-green-100 text-green-700',
  actualizacion: 'bg-blue-100 text-blue-700',
  cambio_estado: 'bg-amber-100 text-amber-700',
  mantenimiento: 'bg-purple-100 text-purple-700',
};

export default function BienDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISOS.EDITAR_BIEN) || hasPermission(PERMISOS.GESTIONAR_BIENES);
  const canDelete = hasPermission(PERMISOS.ELIMINAR_BIEN);
  const [bien, setBien] = useState<Bien | null>(null);
  const [responsable, setResponsable] = useState<any>(null);
  const [historial, setHistorial] = useState<BienHistorial[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'mantenimientos' | 'historial'>(
    tabParam === 'specs' || tabParam === 'mantenimientos' || tabParam === 'historial' ? tabParam : 'info'
  );
  const [mantModalOpen, setMantModalOpen] = useState(false);
  const [mantForm, setMantForm] = useState({ fecha: '', tipo_mantenimiento: '', descripcion: '', estado: 'completado' });
  const [savingMant, setSavingMant] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadBien(); }, [id]);

  const loadBien = async () => {
    if (!id || isNaN(Number(id))) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [bienRes, histRes, mantRes] = await Promise.all([
        getBien(Number(id)),
        getBienHistorial(Number(id)),
        getMantenimientos(Number(id)),
      ]);
      setBien(bienRes.data);
      setResponsable(bienRes.responsable);
      setHistorial(histRes);
      setMantenimientos(mantRes);
    } catch (e) { toast.error(getErrorMessage(e)); navigate('/bienes'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBien(Number(id));
      toast.success('Bien eliminado correctamente');
      navigate('/bienes');
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const parsedId = Number(id);
  if (!id || isNaN(parsedId)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Bien no encontrado.</p>
        <button onClick={() => navigate('/bienes')} className="mt-3 text-sm text-blue-600 hover:underline">Volver a Bienes</button>
      </div>
    );
  }

  const handleEstado = async (nuevoEstado: string) => {
    if (!bien) return;
    try {
      await cambiarEstadoBien(bien.id, nuevoEstado);
      toast.success('Estado actualizado');
      loadBien();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleSaveMantenimiento = async () => {
    if (!bien || !mantForm.fecha) { toast.error('La fecha es obligatoria'); return; }
    setSavingMant(true);
    try {
      await createMantenimiento(bien.id, mantForm);
      toast.success('Mantenimiento registrado');
      setMantModalOpen(false);
      setMantForm({ fecha: '', tipo_mantenimiento: '', descripcion: '', estado: 'completado' });
      loadBien();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSavingMant(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bien no encontrado</p>
        <button onClick={() => navigate('/bienes')} className="mt-4 text-blue-600 hover:underline text-sm">Volver al listado</button>
      </div>
    );
  }

  const estado = ESTADO_CONFIG[bien.estado] || ESTADO_CONFIG.operativo;
  const tipo = (bien as any).tipo_bien || bien.tipoBien;
  const IconoTipo = tipo?.icono ? TIPO_ICONOS[tipo.icono] || Package : Package;

  const tabs = [
    { id: 'info' as const, label: 'Información General' },
    { id: 'specs' as const, label: 'Especificaciones' },
    { id: 'mantenimientos' as const, label: `Mantenimientos (${mantenimientos.length})` },
    { id: 'historial' as const, label: `Historial (${historial.length})` },
  ];

  const responsNombre = responsable ? `${responsable.nombres} ${responsable.apellidos}` : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/bienes')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a Bienes
        </button>
        <div className="flex items-center gap-2">
          {canManage && (
            <button onClick={() => navigate(`/bienes/${id}/editar`)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Pencil className="h-4 w-4" /> Editar Bien
            </button>
          )}
          {canDelete && (
            <button onClick={() => setConfirmDeleteOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" /> Eliminar Bien
            </button>
          )}
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconoTipo className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{tipo?.nombre || 'Bien'}</h1>
            <p className="text-sm font-mono text-blue-600 font-semibold mt-0.5">{bien.codigo}</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${estado.bg} ${estado.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${estado.dot}`} />
              {estado.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Tag className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Área Propietaria</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{bien.area?.nombre || '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Responsable Actual</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{responsNombre || 'Sin designar'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hash className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Código Patrimonial</p>
              <p className="text-sm font-semibold text-gray-900">{bien.codigo_patrimonial || 'No registrado'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sede</p>
              <p className="text-sm font-semibold text-gray-900">
                {bien.sede?.nombre
                  ? `${bien.sede.nombre}${bien.ubicacion ? ` · ${bien.ubicacion}` : ''}`
                  : (bien.ubicacion || 'No especificada')}
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Estado del bien:</span>
            {Object.entries(ESTADO_CONFIG).map(([key, config]) => (
              <button key={key} onClick={() => handleEstado(key)}
                disabled={bien.estado === key}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  bien.estado === key
                    ? `${config.bg} ${config.color} ring-1 ring-current/10 cursor-default`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}>
                {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs + Contenido */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-100 flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Detalles del Bien</h3>
                <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {[
                    { label: 'Marca', value: bien.marca || '-' },
                    { label: 'Modelo', value: bien.modelo || '-' },
                    { label: 'Número de Serie', value: bien.numero_serie || '-' },
                    { label: 'Fecha de Registro', value: new Date(bien.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                    { label: 'Código Patrimonial', value: bien.codigo_patrimonial || '-' },
                    { label: 'Sede', value: bien.sede?.nombre
                      ? `${bien.sede.nombre}${bien.ubicacion ? ` · ${bien.ubicacion}` : ''}`
                      : (bien.ubicacion || '-') },
                  ].map(item => (
                    <div key={item.label} className="flex items-center px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-500 w-48 flex-shrink-0">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                  {bien.observaciones && (
                    <div className="flex items-center px-4 py-3 bg-white">
                      <span className="text-sm text-gray-500 w-48 flex-shrink-0">Observaciones</span>
                      <span className="text-sm text-gray-900">{bien.observaciones}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Información Rápida</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Tipo de Bien</p>
                        <p className="text-sm font-medium text-gray-700">{tipo?.nombre || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CircleCheck className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Estado</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${estado.bg} ${estado.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${estado.dot}`} />
                          {estado.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Última Actualización</p>
                        <p className="text-sm font-medium text-gray-700">{new Date(bien.updated_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Registrado por</p>
                        <p className="text-sm font-medium text-gray-700">Sistema</p>
                      </div>
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Acciones Rápidas</h3>
                    <div className="space-y-2">
                      <button onClick={() => setMantModalOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Wrench className="h-4 w-4" /> Registrar Mantenimiento
                      </button>
                      {canDelete && (
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4" /> Dar de Baja
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {bien.especificaciones && bien.especificaciones.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {bien.especificaciones.map((esp, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{esp.campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm font-medium text-gray-700">{esp.valor || 'No especificado'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No hay especificaciones técnicas registradas</p>
              )}
            </div>
          )}

          {activeTab === 'mantenimientos' && (
            <div className="space-y-4">
              {canManage && (
                <div className="flex justify-end">
                  <button onClick={() => setMantModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    <Plus className="h-4 w-4" /> Registrar Mantenimiento
                  </button>
                </div>
              )}
              {mantenimientos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay mantenimientos registrados</p>
              ) : (
                <div className="space-y-3">
                  {mantenimientos.map(m => (
                    <div key={m.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{m.tipo_mantenimiento || 'Mantenimiento'}</p>
                          <p className="text-xs text-gray-400 mt-1">{m.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{new Date(m.fecha).toLocaleDateString('es-PE')}</p>
                          {m.tecnico && <p className="text-xs text-gray-400 mt-1">Técnico: {m.tecnico.alias}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historial' && (
            <div>
              {historial.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay historial registrado</p>
              ) : (
                <div className="space-y-3">
                  {historial.map(h => (
                    <div key={h.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                        <div className="w-px h-full bg-gray-200 mt-1" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENTO_COLORS[h.tipo_evento] || 'bg-gray-100 text-gray-600'}`}>
                            {h.tipo_evento.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="text-xs text-gray-400">
                            {h.fecha ? new Date(h.fecha).toLocaleString('es-PE') : '-'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{h.descripcion}</p>
                        {h.usuario && <p className="text-xs text-gray-400 mt-1">Por: {h.usuario}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mantModalOpen} onClose={() => setMantModalOpen(false)} title="Registrar Mantenimiento" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={mantForm.fecha} onChange={e => setMantForm({ ...mantForm, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Mantenimiento</label>
            <select value={mantForm.tipo_mantenimiento} onChange={e => setMantForm({ ...mantForm, tipo_mantenimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
              <option value="">Seleccionar...</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
              <option value="Predictivo">Predictivo</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Actualización">Actualización</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
            <textarea value={mantForm.descripcion} onChange={e => setMantForm({ ...mantForm, descripcion: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Describe el mantenimiento realizado..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
            <select value={mantForm.estado} onChange={e => setMantForm({ ...mantForm, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
              <option value="completado">Completado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En Curso</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setMantModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSaveMantenimiento} disabled={savingMant}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {savingMant && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar Bien"
        message={`¿Estás seguro de eliminar el bien "${bien?.codigo || ''}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
