import { useState, useEffect } from 'react';
import { Briefcase, Plus, Pencil, Search, Loader2 } from 'lucide-react';
import type { Cargo } from '../../api/cargoApi';
import { getCargos, createCargo, updateCargo } from '../../api/cargoApi';
import Modal from '../../components/ui/Modal';
import toast from '../../utils/notify';
import { getErrorMessage, getValidationErrors } from '../../api/axios';
import LoadError from '../../components/ui/LoadError';

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => { loadCargos(); }, [search, filterEstado]);

  const loadCargos = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filterEstado) params.estado = filterEstado;
      const res = await getCargos(params);
      setCargos(res.data);
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingCargo(null);
    setForm({ nombre: '', descripcion: '' });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const openEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setForm({ nombre: cargo.nombre, descripcion: cargo.descripcion || '' });
    setFieldErrors(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    setFieldErrors(null);
    try {
      if (editingCargo) {
        await updateCargo(editingCargo.id, form);
        toast.success('Cargo actualizado');
      } else {
        await createCargo(form);
        toast.success('Cargo creado');
      }
      setModalOpen(false);
      loadCargos();
    } catch (e) {
      const errors = getValidationErrors(e);
      setFieldErrors(errors);
      if (!errors) toast.error(getErrorMessage(e));
    } finally { setSaving(false); }
  };

  const toggleEstado = async (cargo: Cargo) => {
    try {
      await updateCargo(cargo.id, { estado: cargo.estado === 'activo' ? 'inactivo' : 'activo' });
      loadCargos();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cargos</h1>
          <p className="text-sm text-gray-500 mt-1">Catálogo de cargos institucionales</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Cargo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar cargo..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" /></div>
        ) : loadError ? (
          <LoadError message="No se pudieron cargar los cargos." onRetry={loadCargos} />
        ) : cargos.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Briefcase className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron cargos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargos.map(cargo => (
                <tr key={cargo.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cargo.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{cargo.descripcion || '-'}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => toggleEstado(cargo)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        cargo.estado === 'activo' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {cargo.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cargo)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'} size="sm">
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cargo <span className="text-red-500">*</span></label>
            <input type="text" value={form.nombre} onChange={e => { setForm({ ...form, nombre: e.target.value }); if (fieldErrors) setFieldErrors(null); }}
              placeholder="Ej: Alcalde, Gerente, Jefe..."
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${fieldErrors?.nombre ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
            {fieldErrors?.nombre && <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe brevemente el cargo..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCargo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
