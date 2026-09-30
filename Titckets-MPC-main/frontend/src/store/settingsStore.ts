import { create } from 'zustand'
import api from '../api/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface SettingsState {
  system_name: string
  logo: string | null
  fetchSettings: () => Promise<void>
}

const useSettingsStore = create<SettingsState>((set) => ({
  system_name: 'MPC Service Desk',
  logo: null,

  fetchSettings: async () => {
    try {
      const { data } = await api.get('/settings')
      set({
        system_name: data?.system_name || 'MPC Service Desk',
        logo: data?.logo ? `${API_URL}/${data.logo}` : null,
      })
    } catch {
      // keep defaults
    }
  },
}))

export default useSettingsStore
