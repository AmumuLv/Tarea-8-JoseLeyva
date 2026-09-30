import api from './axios';

export interface TipoBien {
  id: number;
  nombre: string;
  icono: string | null;
  estado: string;
  created_at: string;
}

export interface BienEspecificacion {
  id?: number;
  campo: string;
  valor: string | null;
}

export interface Mantenimiento {
  id: number;
  bien_id: number;
  tecnico_id: number | null;
  fecha: string;
  tipo_mantenimiento: string | null;
  descripcion: string | null;
  estado: string;
  tecnico?: { id: number; alias: string; codigo: string };
  created_at: string;
}

export interface BienHistorial {
  id: number;
  bien_id: number;
  tipo_evento: string;
  descripcion: string | null;
  usuario: string | null;
  fecha: string | null;
  created_at: string;
}

export interface Bien {
  id: number;
  codigo: string;
  tipo_bien_id: number;
  area_id: number;
  sede_id: number | null;
  estado: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  codigo_patrimonial: string | null;
  ubicacion: string | null;
  observaciones: string | null;
  area?: { id: number; nombre: string };
  sede?: { id: number; nombre: string } | null;
  tipoBien?: TipoBien;
  especificaciones: BienEspecificacion[];
  mantenimientos?: Mantenimiento[];
  historial?: BienHistorial[];
  created_at: string;
  updated_at: string;
}

export interface BienStats {
  total: number;
  operativos: number;
  mantenimiento: number;
  programados: number;
  inactivos: number;
  baja: number;
  por_tipo: { nombre: string; total: number }[];
}

export const getBienes = async (params?: Record<string, any>) => {
  const response = await api.get('/bienes', { params });
  return response.data;
};

export const getBien = async (id: number) => {
  const response = await api.get(`/bienes/${id}`);
  return response.data;
};

export const createBien = async (data: Record<string, any>) => {
  const response = await api.post('/bienes', data);
  return response.data;
};

export const updateBien = async (id: number, data: Record<string, any>) => {
  const response = await api.put(`/bienes/${id}`, data);
  return response.data;
};

export const deleteBien = async (id: number) => {
  const response = await api.delete(`/bienes/${id}`);
  return response.data;
};

export const getBienStats = async (params?: Record<string, any>) => {
  const response = await api.get('/bienes/stats', { params });
  return response.data;
};

export const getBienesPorArea = async (params?: Record<string, any>) => {
  const response = await api.get('/bienes/por-area', { params });
  return response.data;
};

export const cambiarEstadoBien = async (id: number, estado: string) => {
  const response = await api.put(`/bienes/${id}/estado`, { estado });
  return response.data;
};

export const getBienHistorial = async (id: number) => {
  const response = await api.get(`/bienes/${id}/historial`);
  return response.data;
};

export const getMantenimientos = async (bienId: number) => {
  const response = await api.get(`/bienes/${bienId}/mantenimientos`);
  return response.data;
};

export const createMantenimiento = async (bienId: number, data: Record<string, any>) => {
  const response = await api.post(`/bienes/${bienId}/mantenimientos`, data);
  return response.data;
};

export const getTiposBienes = async () => {
  const response = await api.get('/tipos-bienes');
  return response.data;
};

export const getAllTiposBienes = async () => {
  const response = await api.get('/tipos-bienes/all');
  return response.data;
};

export const createTipoBien = async (data: { nombre: string; icono?: string }) => {
  const response = await api.post('/tipos-bienes', data);
  return response.data;
};

export const updateTipoBien = async (id: number, data: Record<string, any>) => {
  const response = await api.put(`/tipos-bienes/${id}`, data);
  return response.data;
};

export const deleteTipoBien = async (id: number) => {
  const response = await api.delete(`/tipos-bienes/${id}`);
  return response.data;
};
