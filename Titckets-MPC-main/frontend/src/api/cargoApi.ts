import api from './axios';

export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  unico: boolean;
  disponible?: boolean;
  created_at: string;
}

export const getCargos = async (params?: { search?: string; estado?: string; per_page?: number }) => {
  const response = await api.get('/cargos', { params });
  return response.data;
};

export const getAllCargos = async () => {
  const response = await api.get('/cargos/all');
  return response.data;
};

export const createCargo = async (data: { nombre: string; descripcion?: string }) => {
  const response = await api.post('/cargos', data);
  return response.data;
};

export const updateCargo = async (id: number, data: { nombre?: string; descripcion?: string; estado?: string }) => {
  const response = await api.put(`/cargos/${id}`, data);
  return response.data;
};

export const deleteCargo = async (id: number) => {
  const response = await api.delete(`/cargos/${id}`);
  return response.data;
};
