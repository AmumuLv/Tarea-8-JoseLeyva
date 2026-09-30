import api from './axios';

export interface Designacion {
  id: number;
  area_id: number;
  usuario_id: number;
  cargo_id: number | null;
  cargo: string | null;
  tipo_designacion: string | null;
  usuario_designador_id: number | null;
  observaciones: string | null;
  fecha_asignacion: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado_asignacion: string;
  activo: boolean;
  area: { id: number; nombre: string; correo: string; estado: string };
  usuario: { id: number; nombres: string; apellidos: string; dni: string; rol: { nombre: string } };
  cargo_relacion: { id: number; nombre: string } | null;
  usuario_designador: { id: number; nombres: string; apellidos: string } | null;
}

export const getDesignaciones = async (params?: { search?: string; estado?: string; per_page?: number }) => {
  const response = await api.get('/designaciones', { params });
  return response.data;
};

export const createDesignacion = async (data: {
  area_id: number;
  usuario_id: number;
  cargo_id: number;
  tipo_designacion: string;
  observaciones?: string;
  fecha_inicio?: string;
}) => {
  const response = await api.post('/designaciones', data);
  return response.data;
};

export const updateDesignacion = async (id: number, data: {
  usuario_id?: number;
  cargo_id?: number;
  tipo_designacion?: string;
  observaciones?: string;
  fecha_inicio?: string;
}) => {
  const response = await api.put(`/designaciones/${id}`, data);
  return response.data;
};

export const finalizarDesignacion = async (id: number) => {
  const response = await api.put(`/designaciones/${id}/finalizar`);
  return response.data;
};

export const getHistorial = async (areaId: number) => {
  const response = await api.get(`/designaciones/historial/${areaId}`);
  return response.data;
};

export const getHistorialPersonal = async (usuarioId: number) => {
  const response = await api.get(`/designaciones/historial-personal/${usuarioId}`);
  return response.data;
};

export const getAreasDisponibles = async () => {
  const response = await api.get('/designaciones/disponibles/areas');
  return response.data;
};

export const getUsuariosDisponibles = async (excludeDesignacionId?: number) => {
  const params: any = {};
  if (excludeDesignacionId) params.exclude_designacion_id = excludeDesignacionId;
  const response = await api.get('/designaciones/disponibles/usuarios', { params });
  return response.data;
};

export const getCargosDisponibles = async (excludeDesignacionId?: number) => {
  const params: any = {};
  if (excludeDesignacionId) params.exclude_designacion_id = excludeDesignacionId;
  const response = await api.get('/designaciones/disponibles/cargos', { params });
  return response.data;
};
