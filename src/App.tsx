import React, { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { OfflineProvider } from './context/OfflineContext'
import Router from './routes/Router'
import ErrorBoundary from './components/ErrorBoundary'
import { checkEnvironment } from './config/env'

function App() {
  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <ErrorBoundary>
      <OfflineProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </OfflineProvider>
    </ErrorBoundary>
  )
}

export default App
