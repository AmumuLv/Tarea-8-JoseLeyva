import api from './axios'

export const getRespuestas = (ticketId: number) =>
  api.get(`/tickets/${ticketId}/respuestas`)

export const createRespuesta = (ticketId: number, data: Record<string, unknown>) =>
  api.post(`/tickets/${ticketId}/respuestas`, data)
