import axios from './axios';

export const getSettings = () => axios.get('/settings');
export const updateSettings = (data: any) => axios.post('/settings', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
  params: { _method: 'PUT' },
});
