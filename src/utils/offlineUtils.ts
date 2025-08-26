import { useOffline } from '../context/OfflineContext'

/**
 * Hook to trigger offline fallback from anywhere in the app
 * Usage: const { triggerOfflineFallback } = useOfflineFallback()
 */
export const useOfflineFallback = () => {
  const { triggerFallback, isOffline } = useOffline()
  
  return {
    triggerOfflineFallback: triggerFallback,
    isOffline
  }
}

/**
 * Utility function to wrap async operations with offline fallback
 * Usage: await withOfflineFallback(asyncOperation, "Custom error message")
 */
export const withOfflineFallback = async <T>(
  operation: () => Promise<T>,
  fallbackMessage?: string,
  showDismissButton: boolean = true
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    // This will be handled by the component using the hook
    // Components should use useOfflineFallback() hook to access triggerOfflineFallback
    throw new Error(fallbackMessage || "Operation failed. Please try again.")
  }
}

/**
 * Common offline fallback messages for different scenarios
 */
export const OFFLINE_MESSAGES = {
  AUTH_FAILED: "Authentication failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  API_UNAVAILABLE: "Service is temporarily unavailable. Please try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  OFFLINE_DETECTED: "You're currently offline. Please check your internet connection.",
  BAPPA_MEDITATING: "Bappa is meditating right now. Please try again soon."
} as const

/**
 * Type for offline fallback messages
 */
export type OfflineMessageKey = keyof typeof OFFLINE_MESSAGES
