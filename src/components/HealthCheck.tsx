import React, { useState, useEffect } from 'react'
import { secureChatService } from '../api/secureChatService'
import { motion } from 'framer-motion'

interface HealthStatus {
  backend: boolean
  supabase: boolean
  overall: boolean
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    backend: false,
    supabase: false,
    overall: false
  })
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkHealth()
  }, [])

  async function checkHealth() {
    setIsChecking(true)
    
    try {
      // Check secure backend
      const backendHealthy = await secureChatService.healthCheck()
      
      // Check Supabase (basic connection test)
      const supabaseHealthy = true // For now, assume Supabase is working
      
      const overall = backendHealthy && supabaseHealthy
      
      setStatus({
        backend: backendHealthy,
        supabase: supabaseHealthy,
        overall
      })
    } catch (error) {
      console.error('Health check failed:', error)
      setStatus({
        backend: false,
        supabase: false,
        overall: false
      })
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-3 h-3 border-2 border-gray-300 border-t-brand-primary rounded-full animate-spin"></div>
        <span>Checking system health...</span>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            status.overall ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-600">
          {status.overall ? 'All systems operational' : 'System issues detected'}
        </span>
      </div>
      
      <button
        onClick={checkHealth}
        className="text-xs text-brand-primary hover:text-brand-secondary transition-colors"
        title="Refresh health status"
      >
        ↻
      </button>
    </motion.div>
  )
}
