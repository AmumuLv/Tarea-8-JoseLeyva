import api from './axios'

export const getAuditoria = (params?: Record<string, unknown>) =>
  api.get('/auditoria', { params })

export const getHistorialJefe = (userId: number) =>
  api.get(`/usuarios/${userId}/historial-jefe`)

export const getAuditoriaUsuario = (userId: number) =>
  api.get(`/usuarios/${userId}/auditoria`)
