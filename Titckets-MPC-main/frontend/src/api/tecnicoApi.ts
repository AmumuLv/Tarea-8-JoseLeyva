import api from './axios'

export const getTecnicos = (params?: Record<string, unknown>) =>
  api.get('/tecnicos', { params })

export const getTecnico = (id: number) =>
  api.get(`/tecnicos/${id}`)

export const createTecnico = (data: Record<string, unknown>) =>
  api.post('/tecnicos', data)

export const updateTecnico = (id: number, data: Record<string, unknown>) =>
  api.put(`/tecnicos/${id}`, data)

export const deleteTecnico = (id: number) =>
  api.delete(`/tecnicos/${id}`)

export const toggleTecnicoEstado = (id: number) =>
  api.put(`/tecnicos/${id}/estado`)

export const getAllTecnicos = () =>
  api.get('/tecnicos/all')

export const getTecnicosStats = () =>
  api.get('/tecnicos/stats')

export const getTecnicoHistorial = (id: number, params?: Record<string, unknown>) =>
  api.get(`/tecnicos/${id}/historial`, { params })

export const getTecnicoStatsDetalle = (id: number) =>
  api.get(`/tecnicos/${id}/stats-detalle`)

export const resetTecnicoPassword = (id: number, password: string) =>
  api.put(`/tecnicos/${id}/reset-password`, { password })
