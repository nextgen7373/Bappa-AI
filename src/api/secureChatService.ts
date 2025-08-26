import type { Message } from '../types'
import { logger } from '../utils/logger'

export interface SecureChatResponse {
  content: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  timestamp: string
}

export class SecureChatService {
  private static instance: SecureChatService
  private readonly API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  private constructor() {}

  static getInstance(): SecureChatService {
    if (!SecureChatService.instance) {
      SecureChatService.instance = new SecureChatService()
    }
    return SecureChatService.instance
  }

  private getAuthToken(): string | null {
    // Get JWT token from localStorage or sessionStorage
    return localStorage.getItem('bappa_auth_token') || sessionStorage.getItem('bappa_auth_token')
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userId: string,
    authToken?: string | null
  ): Promise<SecureChatResponse> {
    const startTime = Date.now()
    const token = authToken || this.getAuthToken()

    if (!token) {
      logger.error('No authentication token found', 'AUTH')
      throw new Error('Authentication required. Please sign in again.')
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          userId
        })
      })

      const duration = Date.now() - startTime
      logger.apiCall('/api/chat', 'POST', response.status, duration)

      if (!response.ok) {
        if (response.status === 401) {
          logger.warn('Authentication failed, token may be expired', 'AUTH')
          throw new Error('Authentication failed. Please sign in again.')
        }
        if (response.status === 429) {
          logger.warn('Rate limit exceeded', 'RATE_LIMIT')
          throw new Error('Daily message limit reached. Please try again tomorrow.')
        }
        if (response.status >= 500) {
          logger.error('Backend server error', 'API', { status: response.status })
          throw new Error('Bappa is experiencing technical difficulties. Please try again later.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        logger.error('API request failed', 'API', { 
          status: response.status, 
          error: errorData.error,
          code: errorData.code 
        })
        throw new Error(errorData.error || 'Failed to generate response. Please try again.')
      }

      const data = await response.json()
      logger.info('AI response generated successfully', 'API', { 
        tokens: data.usage?.total_tokens,
        model: data.model 
      })
      
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      logger.error('Unexpected error in generateResponse', 'API', error)
      throw new Error('An unexpected error occurred. Please try again.')
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now()
      const response = await fetch(`${this.API_BASE_URL}/api/health`)
      const duration = Date.now() - startTime
      
      logger.apiCall('/api/health', 'GET', response.status, duration)
      
      if (response.ok) {
        const data = await response.json()
        logger.info('Backend health check passed', 'HEALTH', data)
        return true
      } else {
        logger.warn('Backend health check failed', 'HEALTH', { status: response.status })
        return false
      }
    } catch (error) {
      logger.error('Backend health check error', 'HEALTH', error)
      return false
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      // This would typically call a refresh endpoint
      // For now, we'll just return false to trigger re-authentication
      logger.info('Token refresh requested', 'AUTH')
      return false
    } catch (error) {
      logger.error('Token refresh failed', 'AUTH', error)
      return false
    }
  }
}

export const secureChatService = SecureChatService.getInstance()
