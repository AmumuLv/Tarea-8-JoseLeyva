import axios from './axios';

export const getAreas = (params?: any) => axios.get('/areas', { params });
export const getArea = (id: number) => axios.get(`/areas/${id}`);
export const createArea = (data: any) => axios.post('/areas', data);
export const updateArea = (id: number, data: any) => axios.put(`/areas/${id}`, data);
export const deleteArea = (id: number) => axios.delete(`/areas/${id}`);
export const getAreaStats = () => axios.get('/areas/stats');
export const getAreaPdf = (id: number) => axios.get(`/areas/${id}/pdf`, { responseType: 'blob' });
