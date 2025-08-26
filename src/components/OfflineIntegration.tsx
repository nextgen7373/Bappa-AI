import React from 'react'
import OfflineFallback from './OfflineFallback'
import { useOffline } from '../context/OfflineContext'

export default function OfflineIntegration() {
  const { showFallback, hideFallback, lastFallbackMessage, lastFallbackConfig } = useOffline()

  return (
    <OfflineFallback
      isVisible={showFallback}
      onDismiss={hideFallback}
      message={lastFallbackMessage}
      showDismissButton={lastFallbackConfig.showDismissButton}
    />
  )
}
