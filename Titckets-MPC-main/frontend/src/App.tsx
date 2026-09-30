import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import ErrorBoundary from './components/errors/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
