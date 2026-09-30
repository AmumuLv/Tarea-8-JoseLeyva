import ErrorPage from './errors/ErrorPage'

/**
 * Compatibilidad: el 404 global usa la página de error reutilizable.
 */
export default function NotFoundPage() {
  return <ErrorPage status={404} />
}
