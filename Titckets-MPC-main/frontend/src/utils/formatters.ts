export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTicketNumber = (numero: string) => numero

export const formatElapsed = (date: string) => {
  const created = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const formatSlaRemaining = (fechaLimite: string) => {
  if (!fechaLimite) return null
  const limite = new Date(fechaLimite)
  const now = new Date()
  const diffMs = limite.getTime() - now.getTime()
  if (diffMs < 0) return 'Vencido'
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatNumber = (n: number) => n.toLocaleString('es-ES')

export const formatTimeAgo = (date: string | null): string => {
  if (!date) return 'Nunca'
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return formatDateTime(date)
}

export const formatFriendlyDate = (date: string | null): string => {
  if (!date) return 'Nunca'
  const now = new Date()
  const past = new Date(date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const pastDay = new Date(past.getFullYear(), past.getMonth(), past.getDate())
  const diffDays = Math.floor((today.getTime() - pastDay.getTime()) / (1000 * 60 * 60 * 24))

  const timeStr = past.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return `Hoy a las ${timeStr}`
  if (diffDays === 1) return `Ayer a las ${timeStr}`
  if (diffDays < 7) return `Hace ${diffDays} días a las ${timeStr}`
  return formatDateTime(date)
}
