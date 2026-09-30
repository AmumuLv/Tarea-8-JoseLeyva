import api from './axios'

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const logout = () => api.post('/auth/logout')

export const refresh = () => api.post('/auth/refresh')

export const me = () => api.get('/auth/me')
