import { useEffect } from 'react'
import useSettingsStore from '../store/settingsStore'

export function useSettings() {
  const system_name = useSettingsStore((s) => s.system_name)
  const logo = useSettingsStore((s) => s.logo)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { system_name, logo }
}
