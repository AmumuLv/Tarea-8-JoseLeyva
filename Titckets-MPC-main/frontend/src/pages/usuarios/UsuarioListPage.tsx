import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Pencil, Trash2, Search, Eye, Shield, Loader2, Camera, X, User, Upload, Calendar } from 'lucide-react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../api/usuarioApi';
import api, { getErrorMessage, getValidationErrors } from '../../api/axios';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DatePicker from '../../components/ui/DatePicker';
import toast from '../../utils/notify';
import LoadError from '../../components/ui/LoadError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  fecha_ingreso: string | null;
  fecha_cese: string | null;
  actualmente_laborando: boolean;
  estado: string;
  foto: string | null;
  rol?: { nombre: string };
  area_actual?: { area: { nombre: string } };
}

function parseLocalDate(dateStr: string): Date {
  const part = dateStr.substring(0, 10);
  const [y, m, d] = part.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(dateStr: string, locale: string = 'es-PE', opts?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(dateStr).toLocaleDateString(locale, opts);
}

function calcAntiguedad(fechaIngreso: string): string {
  const inicio = parseLocalDate(fechaIngreso);
  const hoy = new Date();
  const diffMs = hoy.getTime() - inicio.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  if (anos > 0) return `${anos} ${anos === 1 ? 'año' : 'años'}, ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  if (meses > 0) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  return `${dias} ${dias === 1 ? 'día' : 'días'}`;
}

export default function UsuarioListPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [viewingUser, setViewingUser] = useState<Usuario | null>(null);
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState({
    nombres: '', apellidos: '', dni: '', telefono: '',
    fecha_ingreso: '', fecha_cese: '', actualmente_laborando: true, estado: 'activo',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoRemoved, setFotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDni, setLoadingDni] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lookupDni = async (dni: string) => {
    if (dni.length !== 8) return;
    setLoadingDni(true);
    try {
      const res = await api.post('/dni/lookup', { dni });
      if (res.data.success) {
        setForm(prev => ({ ...prev, nombres: res.data.nombres, apellidos: res.data.apellidos }));
        toast.success('Datos encontrados en RENIEC');
      } else {
        toast.error('DNI no encontrado');
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingDni(false);
    }
  };

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const params: any = { search, per_page: 50, rol_id: 4 };
      if (filterEstado) params.estado = filterEstado;
      const res = await getUsuarios(params);
      setUsuarios(res.data.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [search, filterEstado]);

  const resetForm = () => {
    setForm({
      nombres: '', apellidos: '', dni: '', telefono: '',
      fecha_ingreso: '', fecha_cese: '', actualmente_laborando: true, estado: 'activo',
    });
    setFotoFile(null);
    setFotoPreview(null);
    setFotoRemoved(false);
    setFieldErrors(null);
  };

  const openCreate = () => {
    setEditingUser(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (user: Usuario) => {
    setEditingUser(user);
    setForm({
      nombres: user.nombres,
      apellidos: user.apellidos,
      dni: user.dni || '',
      telefono: user.telefono || '',
      fecha_ingreso: user.fecha_ingreso ? user.fecha_ingreso.split('T')[0] : '',
      fecha_cese: user.fecha_cese ? user.fecha_cese.split('T')[0] : '',
      actualmente_laborando: user.actualmente_laborando ?? true,
      estado: user.estado,
    });
    setFotoFile(null);
    setFotoPreview(user.foto ? `${API_URL}/${user.foto}` : null);
    setFotoRemoved(false);
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openView = (user: Usuario) => {
    setViewingUser(user);
    setViewModalOpen(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG o PNG');
      e.target.value = '';
      return;
    }

    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setFotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fecha_ingreso) {
      toast.error('La fecha de ingreso es obligatoria');
      return;
    }

    if (!form.actualmente_laborando && form.fecha_cese) {
      if (new Date(form.fecha_cese) < new Date(form.fecha_ingreso)) {
        toast.error('La fecha de cese no puede ser anterior a la fecha de ingreso');
        return;
      }
    }

    setSaving(true);
    setFieldErrors(null);
    try {
      const fd = new FormData();
      fd.append('nombres', form.nombres);
      fd.append('apellidos', form.apellidos);
      fd.append('dni', form.dni);
      fd.append('telefono', form.telefono);
      fd.append('fecha_ingreso', form.fecha_ingreso);
      fd.append('actualmente_laborando', form.actualmente_laborando ? '1' : '0');
      if (!form.actualmente_laborando && form.fecha_cese) {
        fd.append('fecha_cese', form.fecha_cese);
      }
      fd.append('estado', form.actualmente_laborando ? 'activo' : 'inactivo');
      if (fotoFile) {
        fd.append('foto', fotoFile);
      } else if (fotoRemoved && editingUser) {
        fd.append('remove_foto', '1');
      }

      if (editingUser) {
        await updateUsuario(editingUser.id, fd);
        toast.success('Usuario actualizado correctamente');
      } else {
        await createUsuario(fd);
        toast.success('Usuario creado correctamente');
      }
      setModalOpen(false);
      resetForm();
      loadUsuarios();
    } catch (err) {
      const errors = getValidationErrors(err);
      setFieldErrors(errors);
      if (!errors) toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUsuario(deletingUser.id);
      toast.success('Usuario eliminado correctamente');
      setConfirmOpen(false);
      setDeletingUser(null);
      loadUsuarios();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getFotoUrl = (foto: string | null) => {
    if (!foto) return undefined;
    return `${API_URL}/${foto}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Personal</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" />
          Nuevo Personal
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={6} className="p-0"><LoadError message="No se pudieron cargar las personas." onRetry={loadUsuarios} /></td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron personas</td></tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {user.foto ? (
                      <img src={getFotoUrl(user.foto)} alt={user.nombres} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{user.nombres?.[0]}{user.apellidos?.[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.nombres} {user.apellidos}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.dni || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openView(user)} className="p-1 text-gray-400 hover:text-blue-600" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(user)} className="p-1 text-gray-400 hover:text-blue-600" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setDeletingUser(user); setConfirmOpen(true); }} className="p-1 text-gray-400 hover:text-red-600" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Editar Personal' : 'Nuevo Personal'} subtitle={editingUser ? 'Actualizar datos del personal' : 'Registrar una nueva persona del sistema'} size="xl">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            <div className="w-48 flex-shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Foto de perfil</label>
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  {fotoPreview ? (
                    <div className="relative">
                      <img src={fotoPreview} alt="Preview" className="h-28 w-28 rounded-full object-cover border-2 border-gray-200" />
                      <button type="button" onClick={removeFoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Camera className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium mb-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir imagen
                </button>
                <p className="text-xs text-gray-400 text-center">JPG, PNG. Max. 2MB</p>
                {fieldErrors?.foto && <p className="mt-1 text-xs text-red-600 text-center">{fieldErrors.foto}</p>}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Información personal</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nombres} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, ''); setForm({ ...form, nombres: e.currentTarget.value }); if (fieldErrors) setFieldErrors(null); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.nombres ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="Ingresa los nombres" required />
                    {fieldErrors?.nombres && <p className="mt-1 text-sm text-red-600">{fieldErrors.nombres}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
                    <input type="text" value={form.apellidos} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, ''); setForm({ ...form, apellidos: e.currentTarget.value }); if (fieldErrors) setFieldErrors(null); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.apellidos ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="Ingresa los apellidos" required />
                    {fieldErrors?.apellidos && <p className="mt-1 text-sm text-red-600">{fieldErrors.apellidos}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.dni}
                        maxLength={8}
                        onInput={(e) => {
                          const val = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 8);
                          setForm({ ...form, dni: val });
                          if (val.length === 8) lookupDni(val);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Ingresa el DNI"
                        required
                      />
                      {loadingDni && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="text" value={form.telefono} maxLength={9} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 9); setForm({ ...form, telefono: e.currentTarget.value }) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ingresa el teléfono" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Información laboral</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso <span className="text-red-500">*</span></label>
                  <DatePicker
                    value={form.fecha_ingreso}
                    onChange={(date) => { setForm({ ...form, fecha_ingreso: date }); if (fieldErrors) setFieldErrors(null); }}
                    required
                  />
                  {fieldErrors?.fecha_ingreso && <p className="mt-1 text-sm text-red-600">{fieldErrors.fecha_ingreso}</p>}
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Actualmente laborando</p>
                    <p className="text-xs text-gray-500">Activa para considerar al personal como activo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, actualmente_laborando: !form.actualmente_laborando, fecha_cese: '' })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.actualmente_laborando ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.actualmente_laborando ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {!form.actualmente_laborando && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cese <span className="text-red-500">*</span></label>
                    <DatePicker
                      value={form.fecha_cese}
                      onChange={(date) => setForm({ ...form, fecha_cese: date })}
                      min={form.fecha_ingreso || ''}
                      required={!form.actualmente_laborando}
                    />
                    <p className="mt-1 text-xs text-gray-500">La fecha de cese no puede ser anterior a la fecha de ingreso.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Detalle del Personal" size="xl">
        {viewingUser && (
          <div className="p-6">
            {/* Header - Three Column Layout */}
            <div className="flex items-center gap-8">
              {/* Left Column - Photo */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  {viewingUser.foto ? (
                    <img
                      src={getFotoUrl(viewingUser.foto)}
                      alt={viewingUser.nombres}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Shield className="h-10 w-10 text-blue-400" />
                    </div>
                  )}
                  <button
                    className="absolute bottom-0 right-0 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100"
                    title="Ver fotografía"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Center Column - Name & Status */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  {viewingUser.nombres} {viewingUser.apellidos}
                </h2>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    viewingUser.estado === 'activo'
                      ? 'bg-green-100 text-green-700'
                      : viewingUser.estado === 'cesado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      viewingUser.estado === 'activo' ? 'bg-green-500' : viewingUser.estado === 'cesado' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    {viewingUser.estado === 'activo' ? 'Activo' : viewingUser.estado === 'cesado' ? 'Cesado' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Right Column - Info Cards */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="bg-gray-50/80 rounded-2xl px-5 py-4 min-w-[180px] border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Fecha de ingreso</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {viewingUser.fecha_ingreso
                      ? formatLocalDate(viewingUser.fecha_ingreso, 'es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {viewingUser.fecha_ingreso ? `Antigüedad: ${calcAntiguedad(viewingUser.fecha_ingreso)}` : ''}
                  </p>
                </div>

                <div className="bg-gray-50/80 rounded-2xl px-5 py-4 min-w-[180px] border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">DNI</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{viewingUser.dni || '-'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Documento de identidad</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {!viewingUser.actualmente_laborando && viewingUser.fecha_cese && (
              <div className="mt-5 bg-red-50/80 border border-red-100 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-red-600">Fecha de cese</span>
                </div>
                <p className="text-sm font-bold text-red-700 mt-1">
                  {formatLocalDate(viewingUser.fecha_cese, 'es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Personal"
        message={`¿Estás seguro de eliminar a "${deletingUser?.nombres} ${deletingUser?.apellidos}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
