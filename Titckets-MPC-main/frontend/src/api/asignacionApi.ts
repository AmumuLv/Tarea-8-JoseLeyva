import axios from './axios';

export const getAsignaciones = (params?: any) => axios.get('/asignaciones', { params });
export const getAsignacion = (id: number) => axios.get(`/asignaciones/${id}`);
export const createAsignacion = (data: any) => axios.post('/asignaciones', data);
export const updateAsignacion = (id: number, data: any) => axios.put(`/asignaciones/${id}`, data);
export const finalizarAsignacion = (id: number, data: any) => axios.put(`/asignaciones/${id}/finalizar`, data);
export const getHistorial = (areaId: number) => axios.get(`/asignaciones/historial/${areaId}`);
export const getAreasDisponibles = () => axios.get('/asignaciones/disponibles/areas');
export const getUsuariosDisponibles = () => axios.get('/asignaciones/disponibles/usuarios');
