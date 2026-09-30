import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ticket, Eye, EyeOff, Mail, Lock, Info, X } from 'lucide-react'
import toast from '../../utils/notify'
import { getErrorMessage, getValidationErrors } from '../../api/axios'
import { login } from '../../api/authApi'
import useAuth from '../../hooks/useAuth'
import { useSettings } from '../../hooks/useSettings'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useAuth()
  const { logo, system_name } = useSettings()

  useEffect(() => {
    if (searchParams.get('e') === '401') {
      toast.info('Tu sesión ha expirado. Inicia sesión nuevamente.')
      setSearchParams({}, { replace: true })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors(null)
    try {
      const response = await login(email, password)
      const token = response.data.token
      await auth.login(token, rememberMe)
      toast.success('Bienvenido')
      navigate('/')
    } catch (err) {
      const errors = getValidationErrors(err)
      setFieldErrors(errors)
      if (!errors) toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12" style={{ backgroundColor: '#d1fae5' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {logo ? (
            <img src={logo} alt="Logo" className="mx-auto mb-5 h-20 w-20 rounded-2xl object-contain shadow-lg" />
          ) : (
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-lg shadow-green-600/30">
              <Ticket className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{system_name || 'MPC Service Desk'}</h1>
          <p className="mt-1.5 text-sm text-gray-500">Inicia sesión para continuar</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors) setFieldErrors(null) }}
                  placeholder="otica@municaasma.gob.pe"
                  required
                  className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors?.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-green-500 focus:ring-green-500/20'}`}
                />
              </div>
              {fieldErrors?.email && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors) setFieldErrors(null) }}
                  placeholder="••••••••"
                  required
                  className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors?.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-green-500 focus:ring-green-500/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors?.password && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-green-600 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full rounded-xl py-2.5 !bg-green-600 hover:!bg-green-700">
              Iniciar Sesión
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="#" className="font-medium text-green-600 hover:underline">Términos y Condiciones</a>
          {' '}y la{' '}
          <a href="#" className="font-medium text-green-600 hover:underline">Política de Privacidad</a>.
        </p>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Info className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Recuperar contraseña</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Comuníquese con la <span className="font-semibold">Oficina de Tecnologías de Información y Comunicaciones</span> para restablecer su contraseña.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-6 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
