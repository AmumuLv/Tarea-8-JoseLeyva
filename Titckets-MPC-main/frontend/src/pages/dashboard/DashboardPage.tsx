import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from '../../utils/notify'
import { getEstadisticas, getTicketsRecientes } from '../../api/dashboardApi'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Loading from '../../components/ui/Loading'
import { formatDate } from '../../utils/formatters'
import { ESTADOS_TICKET } from '../../utils/constants'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          getEstadisticas(),
          getTicketsRecientes(),
        ])
        setStats(statsRes.data)
        setRecentTickets(ticketsRes.data)
      } catch (err) {
        if ((err as any)?.response?.status !== 403) {
          toast.error('Error al cargar el dashboard')
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <Loading />

  const statCards = [
    { label: 'Total Tickets', value: stats?.total || 0, icon: Ticket, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Pendientes', value: stats?.pendientes || 0, icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'En Proceso', value: stats?.en_proceso || 0, icon: AlertCircle, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { label: 'Resueltos', value: stats?.resueltos || 0, icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets Recientes</h2>
            <Link to="/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Ver todos
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentTickets.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No hay tickets recientes
            </div>
          ) : (
            recentTickets.map((ticket: any) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.numero}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {ticket.titulo}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{ESTADOS_TICKET[ticket.estado] || ticket.estado}</Badge>
                  <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
