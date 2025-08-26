import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react'
import type { Message } from '../types'
import { useOffline } from './OfflineContext'
import { chatService } from '../api/chatService'
import { secureChatService } from '../api/secureChatService'
import { useAuth } from './AuthContext'
import { logger } from '../utils/logger'
import { validateMessage, sanitizeInput } from '../utils/security'

interface ChatCtx {
  messages: Message[]
  send: (text: string) => Promise<void>
  remaining: number
  isTyping: boolean
  sessionId: string | null
  isLoading: boolean
}

const ChatContext = createContext<ChatCtx | undefined>(undefined)

const MAX_PER_DAY = 5

export function ChatProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { triggerFallback, isOffline } = useOffline()
  const { user, getAuthToken } = useAuth()
  const sentRef = useRef<number>(0)

  // Initialize chat session and load history
  useEffect(() => {
    async function initializeChat() {
      console.log('🔍 ChatContext: initializeChat called with userId:', userId)
      
      if (!userId) {
        console.log('🔍 ChatContext: No userId, setting loading to false')
        setIsLoading(false)
        return
      }

      try {
        logger.info('Initializing chat session', 'CHAT', { userId })
        console.log('🔍 ChatContext: Starting chat initialization...')
        
        // Get or create chat session
        const session = await chatService.getOrCreateChatSession(userId)
        console.log('🔍 ChatContext: Session created/retrieved:', session)
        setSessionId(session)
        
        // Load chat history
        const history = await chatService.getChatHistory(session)
        console.log('🔍 ChatContext: History loaded, count:', history.length)
        setMessages(history)
        
        // Get daily message count
        const dailyCount = await chatService.getDailyMessageCount(userId)
        console.log('🔍 ChatContext: Daily count retrieved:', dailyCount)
        sentRef.current = dailyCount
        
        logger.info('Chat session initialized successfully', 'CHAT', { 
          sessionId: session, 
          messageCount: history.length,
          dailyCount 
        })
        
        console.log('🔍 ChatContext: Initialization complete!')
        
      } catch (error) {
        console.error('🔍 ChatContext: Error during initialization:', error)
        logger.error('Failed to initialize chat', 'CHAT', error)
        triggerFallback("Failed to load chat history. Please refresh the page.", true)
      } finally {
        console.log('🔍 ChatContext: Setting loading to false')
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [userId, triggerFallback])

  const remaining = Math.max(0, MAX_PER_DAY - sentRef.current)

  async function send(text: string) {
    if (!text.trim() || remaining <= 0 || !sessionId || !userId) {
      logger.warn('Send message blocked', 'CHAT', { 
        hasText: !!text.trim(), 
        remaining, 
        hasSession: !!sessionId, 
        hasUserId: !!userId 
      })
      return
    }
    
    // Check if offline
    if (isOffline) {
      logger.warn('Send message blocked - offline', 'CHAT')
      triggerFallback("You're currently offline. Please check your internet connection and try again.", true)
      return
    }

    // Enhanced input validation and sanitization
    const validation = validateMessage(text)
    if (!validation.isValid) {
      logger.warn('Invalid message rejected', 'CHAT', { error: validation.error })
      triggerFallback(validation.error || "Invalid message. Please try again.", true)
      return
    }

    // Sanitize input to prevent XSS
    const sanitizedText = sanitizeInput(text)
    if (!sanitizedText) {
      logger.warn('Message sanitization resulted in empty text', 'CHAT')
      triggerFallback("Message contains invalid content. Please try again.", true)
      return
    }

    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      sender: 'user', 
      text: sanitizedText, 
      createdAt: Date.now() 
    }
    
    setMessages(m => [...m, userMsg])
    setIsTyping(true)
    
    logger.info('Sending message to AI', 'CHAT', { 
      messageId: userMsg.id, 
      messageLength: sanitizedText.length 
    })
    
    try {
      // Save user message
      await chatService.saveMessage(sessionId, userMsg)
      
      // Prepare conversation history for AI context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }))

      // Get auth token from context
      const authToken = getAuthToken()
      
      // Generate AI response using secure backend
      const aiResponse = await secureChatService.generateResponse(sanitizedText, conversationHistory, userId, authToken)
      
      const bappaMsg: Message = {
        id: crypto.randomUUID(), 
        sender: 'bappa', 
        createdAt: Date.now(),
        text: aiResponse.content
      }
      
      setMessages(m => [...m, bappaMsg])
      
      // Save AI message with usage data
      await chatService.saveMessage(
        sessionId, 
        bappaMsg, 
        aiResponse.usage.completion_tokens,
        aiResponse.model
      )
      
      // Update session and increment daily count
      await chatService.updateSessionMessageCount(sessionId)
      await chatService.incrementDailyMessageCount(userId)
      sentRef.current += 1
      
      logger.info('AI response received and saved', 'CHAT', { 
        responseId: bappaMsg.id,
        tokensUsed: aiResponse.usage.total_tokens,
        model: aiResponse.model
      })
      
    } catch (error) {
      logger.error('Error generating AI response', 'CHAT', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Daily message limit')) {
          logger.warn('Daily message limit reached', 'CHAT', { userId })
          triggerFallback("Daily message limit reached. Please try again tomorrow.", true)
        } else if (error.message.includes('Authentication failed')) {
          logger.warn('Authentication failed during chat', 'CHAT', { userId })
          triggerFallback("Authentication failed. Please sign in again.", true)
        } else if (error.message.includes('Failed to generate')) {
          logger.error('AI generation failed', 'CHAT', { userId, error: error.message })
          triggerFallback("Bappa is experiencing some difficulties. Please try again in a moment.", true)
        } else {
          logger.error('Unexpected chat error', 'CHAT', { userId, error: error.message })
          triggerFallback("Something went wrong. Please try again.", true)
        }
      } else {
        logger.error('Unknown error type in chat', 'CHAT', { userId, error })
        triggerFallback("Bappa is experiencing some difficulties. Please try again in a moment.", true)
      }
      
      // Add a fallback message
      const fallbackMsg: Message = {
        id: crypto.randomUUID(), 
        sender: 'bappa', 
        createdAt: Date.now(),
        text: '🙏 Beta, Bappa is meditating right now. Please try again soon. Ganpati Bappa Morya! — Bappa'
      }
      setMessages(m => [...m, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const value: ChatCtx = { 
    messages, 
    send, 
    remaining: Math.max(0, MAX_PER_DAY - sentRef.current), 
    isTyping,
    sessionId,
    isLoading
  }
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
