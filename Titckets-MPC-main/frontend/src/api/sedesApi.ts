import axios from './axios';

export const getSedes = (params?: any) => axios.get('/sedes', { params });
export const getSede = (id: number) => axios.get(`/sedes/${id}`);
export const createSede = (data: any) => axios.post('/sedes', data);
export const updateSede = (id: number, data: any) => axios.put(`/sedes/${id}`, data);
export const deleteSede = (id: number) => axios.delete(`/sedes/${id}`);
