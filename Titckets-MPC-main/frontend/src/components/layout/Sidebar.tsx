import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Ticket, Users, Building2, Shield, Link2, Briefcase, Settings, UserCircle, X, HelpCircle, Headphones, Package, MapPin } from 'lucide-react'
import usePermission from '../../hooks/usePermission'
import useUIStore from '../../store/uiStore'
import { useSettings } from '../../hooks/useSettings'
import HelpGuide from './HelpGuide'

const NavLinkItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation()
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
  return (
    <NavLink
      to={to}
      onClick={() => window.innerWidth < 1024 && useUIStore.getState().toggleSidebar()}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-50 text-purple-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { hasPermission } = usePermission()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { system_name, logo } = useSettings()
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-7 w-7 rounded-lg object-contain" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="text-base font-bold text-gray-900">{system_name || 'MPC Service Desk'}</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
            <NavLinkItem to="/" icon={LayoutDashboard} label="Dashboard" />

            {/* Mesa de Ayuda */}
            {hasPermission('ver_todos_los_tickets') || hasPermission('ver_tickets_asignados') || hasPermission('ver_mis_tickets') ? (
              <>
                <div className="my-2 border-t border-gray-200" />
                <p className="px-3 py-0.5 text-[10px] font-semibold uppercase text-gray-400">Mesa de Ayuda</p>
                <NavLinkItem to="/tickets" icon={Ticket} label="Tickets" />
              </>
            ) : null}

            {hasPermission('ver_tecnicos') && (
              <NavLinkItem to="/tecnicos" icon={Headphones} label="Técnicos" />
            )}

            {/* Gestion Institucional */}
            {(hasPermission('ver_areas') || hasPermission('ver_sedes') || hasPermission('ver_usuarios') || hasPermission('ver_cargos') || hasPermission('ver_designaciones') || (hasPermission('ver_bienes') && hasPermission('gestionar_bienes'))) && (
              <>
                <div className="my-2 border-t border-gray-200" />
                <p className="px-3 py-0.5 text-[10px] font-semibold uppercase text-gray-400">Gestión Institucional</p>
                {hasPermission('ver_areas') && <NavLinkItem to="/areas" icon={Building2} label="Áreas" />}
                {hasPermission('ver_sedes') && <NavLinkItem to="/sedes" icon={MapPin} label="Sedes" />}
                {hasPermission('ver_usuarios') && <NavLinkItem to="/usuarios" icon={Users} label="Personal" />}
                {hasPermission('ver_cargos') && <NavLinkItem to="/cargos" icon={Briefcase} label="Cargos" />}
                {hasPermission('ver_designaciones') && <NavLinkItem to="/designaciones" icon={Link2} label="Designaciones" />}
                {hasPermission('ver_bienes') && (hasPermission('ver_areas') || hasPermission('gestionar_bienes')) && (
                  <NavLinkItem to="/bienes" icon={Package} label="Bienes" />
                )}
              </>
            )}

            {/* Bienes area for non-admin users */}
            {!hasPermission('ver_areas') && hasPermission('ver_perfil_area') && (
              <>
                <div className="my-2 border-t border-gray-200" />
                <p className="px-3 py-0.5 text-[10px] font-semibold uppercase text-gray-400">Bienes</p>
                <NavLinkItem to="/bienes/mi-area" icon={Package} label="Bienes" />
              </>
            )}

            {/* Administracion */}
            {(hasPermission('ver_auditoria') || hasPermission('configurar_sistema')) && (
              <>
                <div className="my-2 border-t border-gray-200" />
                <p className="px-3 py-0.5 text-[10px] font-semibold uppercase text-gray-400">Administración</p>
                {hasPermission('ver_auditoria') && <NavLinkItem to="/auditoria" icon={Shield} label="Auditoría" />}
                {hasPermission('configurar_sistema') && <NavLinkItem to="/configuracion" icon={Settings} label="Configuración" />}
              </>
            )}

            {/* Perfil Area - for area users and technicians */}
            {hasPermission('ver_perfil_area') && (
              <>
                <div className="my-2 border-t border-gray-200" />
                <p className="px-3 py-0.5 text-[10px] font-semibold uppercase text-gray-400">Mi Área</p>
                <NavLinkItem to="/perfil-area" icon={UserCircle} label="Perfil del Área" />
              </>
            )}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-800">¿Necesitas ayuda?</p>
                <button onClick={() => setGuideOpen(true)} className="text-[11px] font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  Ver guía →
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {guideOpen && <HelpGuide onClose={() => setGuideOpen(false)} />}
    </>
  )
}
