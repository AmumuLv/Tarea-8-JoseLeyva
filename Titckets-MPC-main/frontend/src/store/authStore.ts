import { create } from 'zustand'
import { me } from '../api/authApi'

interface User {
  id: number
  nombres: string
  apellidos: string
  name: string
  email: string
  rol: { id: number; nombre: string } | null
  rol_id: number | null
  permissions: string[]
  areaInstitucional?: { id: number; nombre: string } | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  hasPermission: (perm: string) => boolean
}

const initialToken = localStorage.getItem('token') || sessionStorage.getItem('token')

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: !!initialToken,

  login: async (token: string, remember = false) => {
    if (remember) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
    set({ token, isAuthenticated: true, isLoading: true })
    await get().loadUser()
  },

  logout: async () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  loadUser: async () => {
    set({ isLoading: true })
    try {
      const response = await me()
      const raw = response.data.user
      const user = {
        ...raw,
        permissions: response.data.permissions,
        areaInstitucional: raw.areaInstitucional || raw.area_institucional || null,
      }
      set({ user, isLoading: false })
    } catch {
      await get().logout()
    }
  },

  hasPermission: (perm: string) => {
    const { user } = get()
    if (!user) return false
    if (user.rol?.nombre === 'Administrador') return true
    return user.permissions?.includes(perm) ?? false
  },
}))

export default useAuthStore
