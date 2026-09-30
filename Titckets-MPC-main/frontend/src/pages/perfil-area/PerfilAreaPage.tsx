import { useState, useEffect } from 'react';
import { Building2, User, Shield, Activity, Lock, Eye, EyeOff, Check, Calendar, Mail, Phone, Clock, Ticket, AlertCircle } from 'lucide-react';
import { getAreaProfile, changeAreaPassword } from '../../api/areaProfileApi';
import toast from '../../utils/notify';
import { getErrorMessage } from '../../api/axios';

interface AreaProfile {
  area: {
    id: number;
    nombre: string;
    correo: string;
    descripcion: string;
    estado: string;
    created_at: string;
  };
  responsable: {
    nombres: string;
    apellidos: string;
    cargo: string;
    telefono: string;
    dni: string;
  } | null;
  asignacion: {
    fecha_asignacion: string;
    cargo: string;
  } | null;
  actividad: {
    ultimo_acceso: string;
    ip_ultimo_acceso: string;
    tickets_creados: number;
    tickets_abiertos: number;
    tickets_cerrados: number;
  };
}

export default function PerfilAreaPage() {
  const [profile, setProfile] = useState<AreaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getAreaProfile();
      setProfile(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSaving(true);
    try {
      await changeAreaPassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      });
      toast.success('Contraseña actualizada correctamente');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatDateTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Perfil del Área</h1>
        <p className="text-sm text-gray-500 mt-1">Información institucional y configuración de seguridad de tu área.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Información del Área */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Información del Área</h2>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{profile.area.nombre}</h3>
              <p className="text-sm text-gray-500">{profile.area.descripcion || 'Área institucional'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Correo Institucional</p>
                <p className="text-sm font-medium text-gray-900">{profile.area.correo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${profile.area.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="text-sm font-medium text-gray-900">{profile.area.estado === 'activo' ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Creación</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(profile.area.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Último Acceso</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(profile.actividad.ultimo_acceso)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsable del Área */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Responsable del Área</h2>
          </div>

          {profile.responsable ? (
            <>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-700">
                    {getInitials(profile.responsable.nombres, profile.responsable.apellidos)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profile.responsable.nombres} {profile.responsable.apellidos}</h3>
                  <p className="text-sm text-blue-600 font-medium">{profile.responsable.cargo || 'Jefe de Área'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-500">DNI</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">DNI</p>
                    <p className="text-sm font-medium text-gray-900">{profile.responsable.dni || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono Institucional</p>
                    <p className="text-sm font-medium text-gray-900">{profile.responsable.telefono || '-'}</p>
                  </div>
                </div>
                {profile.asignacion && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Asignación</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(profile.asignacion.fecha_asignacion)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-800">El responsable solo puede ser modificado por un administrador desde el panel de administración.</span>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay responsable asignado</p>
              <p className="text-xs text-gray-400 mt-1">Contacta al administrador para asignar un responsable.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Seguridad */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña Actual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>Restricciones:</strong> No puedes modificar tu correo, nombre del área, responsable, permisos ni usuarios. Solo OTIC puede realizar cambios de administración.
            </p>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Último Inicio de Sesión</h3>
              </div>
              <p className="text-sm text-gray-900 font-medium ml-8">{formatDateTime(profile.actividad.ultimo_acceso)}</p>
              {profile.actividad.ip_ultimo_acceso && (
                <p className="text-xs text-gray-500 ml-8 mt-1">IP: {profile.actividad.ip_ultimo_acceso}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <Ticket className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.actividad.tickets_creados}</p>
                <p className="text-xs text-gray-500">Creados</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.actividad.tickets_abiertos}</p>
                <p className="text-xs text-gray-500">Abiertos</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.actividad.tickets_cerrados}</p>
                <p className="text-xs text-gray-500">Cerrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
