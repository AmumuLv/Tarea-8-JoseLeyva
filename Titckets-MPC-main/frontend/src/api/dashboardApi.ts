import api from './axios'

export const getEstadisticas = () => api.get('/dashboard/estadisticas')

export const getTicketsRecientes = () => api.get('/dashboard/recientes')
