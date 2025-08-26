import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useOnline } from '../hooks/useOnline'

interface OfflineContextType {
  isOffline: boolean
  showFallback: boolean
  triggerFallback: (message?: string, showDismissButton?: boolean) => void
  hideFallback: () => void
  lastFallbackMessage: string
  lastFallbackConfig: {
    showDismissButton: boolean
  }
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnline()
  const [showFallback, setShowFallback] = useState(false)
  const [lastFallbackMessage, setLastFallbackMessage] = useState("Bappa is meditating right now. Please try again soon.")
  const [lastFallbackConfig, setLastFallbackConfig] = useState({ showDismissButton: true })

  // Auto-hide fallback when coming back online
  useEffect(() => {
    if (isOnline && showFallback) {
      const timer = setTimeout(() => {
        setShowFallback(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showFallback])

  // Auto-show fallback when going offline
  useEffect(() => {
    if (!isOnline && !showFallback) {
      setShowFallback(true)
      setLastFallbackMessage("You're currently offline. Please check your internet connection.")
      setLastFallbackConfig({ showDismissButton: false })
    }
  }, [isOnline, showFallback])

  const triggerFallback = useCallback((message?: string, showDismissButton: boolean = true) => {
    setLastFallbackMessage(message || "Bappa is meditating right now. Please try again soon.")
    setLastFallbackConfig({ showDismissButton })
    setShowFallback(true)
  }, [])

  const hideFallback = useCallback(() => {
    setShowFallback(false)
  }, [])

  const value: OfflineContextType = {
    isOffline: !isOnline,
    showFallback,
    triggerFallback,
    hideFallback,
    lastFallbackMessage,
    lastFallbackConfig
  }

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider')
  }
  return context
}
