import axios from './axios';

export const getUsuarios = (params?: any) => axios.get('/usuarios', { params });
export const getUsuario = (id: number) => axios.get(`/usuarios/${id}`);
export const getTecnicos = (params?: any) => axios.get('/usuarios/tecnicos', { params });
export const createUsuario = (data: any) => axios.post('/usuarios', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateUsuario = (id: number, data: any) => axios.post(`/usuarios/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
  params: { _method: 'PUT' },
});
export const deleteUsuario = (id: number) => axios.delete(`/usuarios/${id}`);
export const toggleEstado = (id: number) => axios.put(`/usuarios/${id}/estado`);
