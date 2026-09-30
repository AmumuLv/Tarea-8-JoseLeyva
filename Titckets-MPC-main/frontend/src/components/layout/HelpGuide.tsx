import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, LayoutDashboard, Ticket, Users, Building2, Package, Settings, Headphones, Link2, Briefcase, Shield, HelpCircle } from 'lucide-react'
import usePermission from '../../hooks/usePermission'
import { PERMISOS } from '../../utils/permissions'

interface Step {
  icon: any
  title: string
  description: string
  details: string[]
  color: string
}

export default function HelpGuide({ onClose }: { onClose: () => void }) {
  const { hasPermission } = usePermission()
  const [step, setStep] = useState(0)

  const steps: Step[] = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Tu pantalla principal con un resumen del sistema.',
      details: [
        'Visualiza estadísticas generales de tickets',
        'Accede a los tickets recientes',
        'Filtra por estado: pendientes, en proceso, resueltos',
      ],
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Ticket,
      title: 'Tickets',
      description: 'Gestiona las solicitudes de soporte técnico.',
      details: [
        'Crea un ticket con el botón "Nuevo Ticket"',
        'Selecciona categoría, prioridad y área',
        'Asigna un técnico (solo admin)',
        'Cambia el estado: pendiente → asignado → en proceso → resuelto → cerrado',
        'Adjunta evidencias (fotos) y comenta en el chat',
      ],
      color: 'bg-purple-100 text-purple-600',
    },
    ...(hasPermission(PERMISOS.VER_TECNICOS) ? [
      {
        icon: Headphones,
        title: 'Técnicos',
        description: 'Administra el equipo de soporte técnico.',
        details: [
          'Registra nuevos técnicos del area de TI',
          'Visualiza estadísticas de cada técnico',
          'Revisa el historial de actividad',
          'Restablece contraseñas si es necesario',
        ],
        color: 'bg-green-100 text-green-600',
      },
    ] : []),
    ...(hasPermission(PERMISOS.VER_AREAS) ? [
      {
        icon: Building2,
        title: 'Áreas',
        description: 'Gestiona las áreas organizacionales.',
        details: [
          'Crea, edita y administra áreas',
          'Cada área tiene un correo institucional',
          'Visualiza el perfil de cada área con sus bienes y personal',
        ],
        color: 'bg-amber-100 text-amber-600',
      },
      {
        icon: Users,
        title: 'Personal',
        description: 'Administra los usuarios del sistema.',
        details: [
          'Registra personal con sus datos laborales',
          'Consulta por DNI automáticamente',
          'Activa o desactiva usuarios',
          'Asigna roles: Administrador, Técnico, Área Usuaria',
        ],
        color: 'bg-rose-100 text-rose-600',
      },
      {
        icon: Link2,
        title: 'Designaciones',
        description: 'Asigna personal a áreas con cargos específicos.',
        details: [
          'Designa quién es titular o encargado de un área',
          'Los cargos con "único" solo permiten una persona',
          'Finaliza designaciones cuando el personal cambie',
          'Revisa el historial de designaciones por área',
        ],
        color: 'bg-indigo-100 text-indigo-600',
      },
      {
        icon: Briefcase,
        title: 'Cargos',
        description: 'Define los puestos de trabajo disponibles.',
        details: [
          'Crea cargos como "Jefe de Área", "Asistente", etc.',
          'Marca cargos como "únicos" si solo puede haber uno',
          'Los cargos se usan en las designaciones',
        ],
        color: 'bg-teal-100 text-teal-600',
      },
    ] : []),
    ...(hasPermission(PERMISOS.VER_BIENES) ? [
      {
        icon: Package,
        title: 'Bienes',
        description: 'Inventario de activos de la municipalidad.',
        details: [
          'Registra bienes con código, tipo y ubicación',
          'Asigna bienes a áreas específicas',
          'Registra mantenimientos y cambios de estado',
          'Visualiza bienes por área y por tipo',
        ],
        color: 'bg-cyan-100 text-cyan-600',
      },
    ] : []),
    ...(hasPermission(PERMISOS.VER_AUDITORIA) ? [
      {
        icon: Shield,
        title: 'Auditoría',
        description: 'Registro de todas las acciones del sistema.',
        details: [
          'Visualiza quién hizo qué y cuándo',
          'Filtra por usuario, acción o fecha',
          'Incluye inicios de sesión, creaciones, ediciones',
          'Registra intentos de acceso fallidos',
        ],
        color: 'bg-orange-100 text-orange-600',
      },
    ] : []),
    ...(hasPermission(PERMISOS.CONFIGURAR_SISTEMA) ? [
      {
        icon: Settings,
        title: 'Configuración',
        description: 'Personaliza la apariencia del sistema.',
        details: [
          'Cambia el nombre del sistema',
          'Actualiza el logo institucional',
          'Solo los administradores pueden acceder',
        ],
        color: 'bg-gray-100 text-gray-600',
      },
    ] : []),
    {
      icon: HelpCircle,
      title: 'Consejos',
      description: 'Recomendaciones para usar el sistema.',
      details: [
        'Usa el buscador para encontrar tickets rápidamente',
        'Filtra por estado, área o técnico',
        'Adjunta fotos como evidencia en los tickets',
        'Revisa el historial para ver cambios anteriores',
        'Contacta al administrador si tienes problemas',
      ],
      color: 'bg-violet-100 text-violet-600',
    },
  ]

  const current = steps[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">Guía del Sistema</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{step + 1} / {steps.length}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${current.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 text-center mb-6">{current.description}</p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            {current.details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-3 w-3 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with arrows */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === step ? 'w-6 bg-purple-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700"
            >
              ¡Entendido!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
