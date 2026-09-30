import api from './axios'

export const getTickets = (params?: Record<string, unknown>) =>
  api.get('/tickets', { params })

export const getTicket = (id: number) => api.get(`/tickets/${id}`)

export const createTicket = (data: Record<string, unknown>) =>
  api.post('/tickets', data)

export const updateTicket = (id: number, data: Record<string, unknown>) =>
  api.put(`/tickets/${id}`, data)

export const cambiarEstado = (id: number, estado: string, comentario?: string) =>
  api.put(`/tickets/${id}/estado`, { estado, comentario })

export const asignarTecnico = (id: number, tecnico_id: number) =>
  api.put(`/tickets/${id}/asignar`, { tecnico_id })

export const historial = (id: number) => api.get(`/tickets/${id}/historial`)

export const uploadEvidencia = (id: number, formData: FormData) =>
  api.post(`/tickets/${id}/evidencia`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteEvidencia = (ticketId: number, evidenciaId: number) =>
  api.delete(`/tickets/${ticketId}/evidencia/${evidenciaId}`)
