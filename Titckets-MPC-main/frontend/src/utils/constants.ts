export const ESTADOS_TICKET: Record<string, string> = {
  pendiente: 'Nuevo',
  asignado: 'Asignado',
  en_proceso: 'En Proceso',
  en_espera: 'Pendiente',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado',
}

export const ESTADO_DOT_COLOR: Record<string, string> = {
  pendiente: 'bg-gray-400',
  asignado: 'bg-blue-500',
  en_proceso: 'bg-yellow-500',
  en_espera: 'bg-purple-500',
  resuelto: 'bg-emerald-500',
  cerrado: 'bg-gray-600',
  cancelado: 'bg-red-500',
}

export const CATEGORIAS: Record<string, string> = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red',
  internet: 'Internet',
  impresora: 'Impresora',
  correo: 'Correo Electrónico',
  seguridad: 'Seguridad',
  otro: 'Otro',
}

export interface CategoriaIncidencia {
  id: string
  label: string
  icon: string
  color: string
  incidencias: string[]
}

export const CATEGORIAS_NUEVAS: CategoriaIncidencia[] = [
  {
    id: 'hardware',
    label: 'Equipo de Cómputo',
    icon: 'Monitor',
    color: 'blue',
    incidencias: [
      'No enciende',
      'Equipo lento',
      'Pantalla azul',
      'Pantalla negra',
      'Reinicios constantes',
      'Problemas con teclado',
      'Problemas con mouse',
      'Otro',
    ],
  },
  {
    id: 'impresora',
    label: 'Impresoras',
    icon: 'Printer',
    color: 'purple',
    incidencias: [
      'No imprime',
      'Atasco de papel',
      'Sin tinta',
      'Sin conexión',
      'Instalación',
      'Configuración',
      'Otro',
    ],
  },
  {
    id: 'red',
    label: 'Red e Internet',
    icon: 'Wifi',
    color: 'cyan',
    incidencias: [
      'Sin conexión a internet',
      'Conexión lenta',
      'No accede a intranet',
      'Problemas con VPN',
      'Caídas intermitentes',
      'Configuración de red',
      'Otro',
    ],
  },
  {
    id: 'correo',
    label: 'Correo Institucional',
    icon: 'Mail',
    color: 'amber',
    incidencias: [
      'No puedo ingresar',
      'Restablecer contraseña',
      'No recibe correos',
      'No envía correos',
      'Crear cuenta',
      'Configuración Outlook',
      'Otro',
    ],
  },
  {
    id: 'seguridad',
    label: 'Accesos y Contraseñas',
    icon: 'Shield',
    color: 'red',
    incidencias: [
      'No puedo acceder al sistema',
      'Olvidé mi contraseña',
      'Cuenta bloqueada',
      'Permiso denegado',
      'Solicitar acceso',
      'Revocar acceso',
      'Otro',
    ],
  },
  {
    id: 'software',
    label: 'Sistemas Institucionales',
    icon: 'Layout',
    color: 'indigo',
    incidencias: [
      'Sistema no carga',
      'Error en el sistema',
      'Sistema lento',
      'No guarda información',
      'Error al exportar',
      'Instalación de software',
      'Otro',
    ],
  },
  {
    id: 'telefono',
    label: 'Telefonía',
    icon: 'Phone',
    color: 'teal',
    incidencias: [
      'Teléfono no funciona',
      'No marca llamadas',
      'No recibe llamadas',
      'Ruido en la línea',
      'Instalación de equipo',
      'Configuración',
      'Otro',
    ],
  },
  {
    id: 'otro',
    label: 'Otros',
    icon: 'MoreHorizontal',
    color: 'gray',
    incidencias: [
      'Otro',
    ],
  },
]

export const ESTADO_OPTIONS = Object.entries(ESTADOS_TICKET).map(([value, label]) => ({ value, label }))
export const CATEGORIA_OPTIONS = Object.entries(CATEGORIAS).map(([value, label]) => ({ value, label }))

export const TIPO_CAMBIO_ICONS: Record<string, string> = {
  creacion: 'TicketPlus',
  actualizacion: 'Pencil',
  estado: 'ArrowRightLeft',
  asignacion: 'UserPlus',
  comentario: 'MessageSquare',
  evidencia: 'Camera',
  calificacion: 'Star',
  respuesta: 'Reply',
}
