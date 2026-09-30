import { useState, useEffect, useRef } from 'react';
import { Settings, Save, Loader2, Upload, X } from 'lucide-react';
import { getSettings, updateSettings } from '../../api/settingsApi';
import useSettingsStore from '../../store/settingsStore';
import toast from '../../utils/notify';
import { getErrorMessage } from '../../api/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ConfiguracionPage() {
  const [systemName, setSystemName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      setSystemName(res.data.system_name || 'MPC Service Desk');
      if (res.data.logo) {
        setLogoPreview(`${API_URL}/${res.data.logo}`);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('El logo no debe superar 2MB');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o SVG');
      e.target.value = '';
      return;
    }

    setLogoFile(file);
    setLogoRemoved(false);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('system_name', systemName);
      if (logoFile) {
        fd.append('logo', logoFile);
      } else if (logoRemoved) {
        fd.append('remove_logo', '1');
      }
      await updateSettings(fd);
      useSettingsStore.getState().fetchSettings();
      toast.success('Configuración actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">General</h2>

          <div className="flex gap-8">
            <div className="w-48 flex-shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Logo del sistema</label>
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo" className="h-28 w-28 rounded-xl object-contain border-2 border-gray-200 bg-gray-50" />
                      <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 w-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Settings className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium mb-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir logo
                </button>
                <p className="text-xs text-gray-400 text-center">JPG, PNG o SVG. Máx. 2MB</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Información del sistema</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sistema <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del sistema"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Se mostrará en el sidebar y otras partes de la interfaz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
