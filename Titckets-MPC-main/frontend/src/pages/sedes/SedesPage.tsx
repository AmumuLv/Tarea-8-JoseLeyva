import { useState, useEffect, useMemo } from 'react';
import { MapPin, Plus, Pencil, Trash2, Search, Package, Copy } from 'lucide-react';
import { getSedes, createSede, updateSede, deleteSede } from '../../api/sedesApi';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from '../../utils/notify';
import { getErrorMessage, getValidationErrors } from '../../api/axios';
import LoadError from '../../components/ui/LoadError';

interface Sede {
  id: number;
  nombre: string;
  direccion: string | null;
  descripcion: string | null;
  estado: string;
  bienes_count: number;
  created_at?: string;
}

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [deletingSede, setDeletingSede] = useState<Sede | null>(null);
  const [form, setForm] = useState({ nombre: '', direccion: '', descripcion: '', estado: 'activo' });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSedes({ per_page: 100 });
      setSedes(res.data.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSede(null);
    setForm({ nombre: '', direccion: '', descripcion: '', estado: 'activo' });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openEdit = (sede: Sede) => {
    setEditingSede(sede);
    setForm({
      nombre: sede.nombre,
      direccion: sede.direccion || '',
      descripcion: sede.descripcion || '',
      estado: sede.estado,
    });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors(null);
    try {
      if (editingSede) {
        await updateSede(editingSede.id, form);
        toast.success('Sede actualizada correctamente');
      } else {
        await createSede(form);
        toast.success('Sede creada correctamente');
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
    if (!deletingSede) return;
    try {
      await deleteSede(deletingSede.id);
      toast.success('Sede eliminada correctamente');
      setConfirmOpen(false);
      setDeletingSede(null);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const copyDireccion = (direccion: string) => {
    navigator.clipboard.writeText(direccion);
    toast.success('Dirección copiada');
  };

  const filteredSedes = useMemo(() => {
    if (!search) return sedes;
    const s = search.toLowerCase();
    return sedes.filter(
      (sede) =>
        sede.nombre.toLowerCase().includes(s) ||
        sede.direccion?.toLowerCase().includes(s) ||
        sede.descripcion?.toLowerCase().includes(s)
    );
  }, [sedes, search]);

  const totalBienes = useMemo(() => sedes.reduce((acc, s) => acc + (s.bienes_count || 0), 0), [sedes]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las sedes de la municipalidad y la ubicación de los bienes.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" />
          Registrar Sede
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sedes Totales</p>
              <p className="text-2xl font-bold text-gray-900">{sedes.length}</p>
              <p className="text-xs text-gray-400">Sedes registradas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bienes con Sede</p>
              <p className="text-2xl font-bold text-gray-900">{totalBienes}</p>
              <p className="text-xs text-gray-400">En todas las sedes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{sedes.filter((s) => s.estado === 'activo').length}</p>
              <p className="text-xs text-gray-400">Operando actualmente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, dirección o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[30%]">Sede</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[30%]">Dirección</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">Bienes</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[15%]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={5} className="p-0"><LoadError message="No se pudieron cargar las sedes." onRetry={loadData} /></td></tr>
            ) : filteredSedes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron sedes</td></tr>
            ) : (
              filteredSedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{sede.nombre}</div>
                        {sede.descripcion && <div className="text-sm text-gray-500 truncate">{sede.descripcion}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-600 truncate">{sede.direccion || '-'}</span>
                      {sede.direccion && (
                        <button onClick={() => copyDireccion(sede.direccion!)} className="text-gray-400 hover:text-gray-600 flex-shrink-0" title="Copiar dirección">
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sede.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sede.estado === 'activo' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-medium ${
                      sede.bienes_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sede.bienes_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(sede)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setDeletingSede(sede); setConfirmOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSede ? 'Editar Sede' : 'Registrar Sede'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la sede <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => { setForm({ ...form, nombre: e.target.value }); if (fieldErrors) setFieldErrors(null); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors?.nombre ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Ej: Sede Principal"
              required
            />
            {fieldErrors?.nombre && <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Jr. Bolognesi 123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="activo">Activa</option>
              <option value="inactivo">Inactiva</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : editingSede ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Sede"
        message={`¿Estás seguro de eliminar la sede "${deletingSede?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
