import type { Message } from '../types'

export interface ChatSession {
  id: string
  userId: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

export class ChatService {
  private static instance: ChatService
  private readonly STORAGE_KEY = 'bappa_chat_sessions'
  private readonly MESSAGE_COUNT_KEY = 'bappa_daily_messages'

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  private getStorageKey(userId: string): string {
    return `${this.STORAGE_KEY}_${userId}`
  }

  private getDailyMessageKey(userId: string): string {
    const today = new Date().toISOString().split('T')[0]
    return `${this.MESSAGE_COUNT_KEY}_${userId}_${today}`
  }

  async createChatSession(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID()
    const now = Date.now()
    
    const session: ChatSession = {
      id: sessionId,
      userId,
      createdAt: now,
      updatedAt: now,
      messageCount: 0
    }

    // Store session in local storage
    const sessions = this.getSessions(userId)
    sessions.push(session)
    this.saveSessions(userId, sessions)

    return sessionId
  }

  async getOrCreateChatSession(userId: string): Promise<string> {
    const sessions = this.getSessions(userId)
    
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1]
      const sessionDate = new Date(lastSession.createdAt)
      const today = new Date()
      
      // If last session is from today, use it
      if (sessionDate.toDateString() === today.toDateString()) {
        return lastSession.id
      }
    }

    // Create new session for today
    return this.createChatSession(userId)
  }

  async saveMessage(
    sessionId: string,
    message: Omit<Message, 'id' | 'createdAt'>,
    tokensUsed?: number,
    modelUsed?: string
  ): Promise<void> {
    const userId = this.getUserIdFromSession(sessionId)
    if (!userId) return

    const sessions = this.getSessions(userId)
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    
    if (sessionIndex !== -1) {
      // Update session message count
      sessions[sessionIndex].messageCount += 1
      sessions[sessionIndex].updatedAt = Date.now()
      this.saveSessions(userId, sessions)
    }

    // Store message in local storage
    const messageKey = `bappa_messages_${sessionId}`
    const messages = this.getMessages(sessionId)
    messages.push({
      ...message,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    })
    this.saveMessages(sessionId, messages)
  }

  async getChatHistory(sessionId: string): Promise<Message[]> {
    const messageKey = `bappa_messages_${sessionId}`
    return this.getMessages(sessionId)
  }

  async getDailyMessageCount(userId: string): Promise<number> {
    const dailyKey = this.getDailyMessageKey(userId)
    const count = localStorage.getItem(dailyKey)
    return count ? parseInt(count, 10) : 0
  }

  async incrementDailyMessageCount(userId: string): Promise<void> {
    const dailyKey = this.getDailyMessageKey(userId)
    const currentCount = await this.getDailyMessageCount(userId)
    localStorage.setItem(dailyKey, (currentCount + 1).toString())
  }

  // This method is no longer needed since we use secureChatService
  // async generateAIResponse(
  //   userMessage: string,
  //   conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  // ): Promise<GroqResponse> {
  //   return groqService.generateResponse(userMessage, conversationHistory)
  // }

  async updateSessionMessageCount(sessionId: string): Promise<void> {
    // This is now handled in saveMessage
    return Promise.resolve()
  }

  // Helper methods for local storage
  private getSessions(userId: string): ChatSession[] {
    const key = this.getStorageKey(userId)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveSessions(userId: string, sessions: ChatSession[]): void {
    const key = this.getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(sessions))
  }

  private getMessages(sessionId: string): Message[] {
    const key = `bappa_messages_${sessionId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveMessages(sessionId: string, messages: Message[]): void {
    const key = `bappa_messages_${sessionId}`
    localStorage.setItem(key, JSON.stringify(messages))
  }

  private getUserIdFromSession(sessionId: string): string | null {
    // Search through all stored sessions to find the user ID
    const keys = Object.keys(localStorage)
    const sessionKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY))
    
    for (const key of sessionKeys) {
      const sessions: ChatSession[] = JSON.parse(localStorage.getItem(key) || '[]')
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        return session.userId
      }
    }
    
    return null
  }

  // Cleanup method to remove old sessions (optional)
  cleanupOldSessions(userId: string, daysToKeep: number = 7): void {
    const sessions = this.getSessions(userId)
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    
    const validSessions = sessions.filter(session => session.createdAt > cutoffDate)
    
    if (validSessions.length !== sessions.length) {
      this.saveSessions(userId, validSessions)
      
      // Also clean up old messages
      const removedSessions = sessions.filter(session => session.createdAt <= cutoffDate)
      removedSessions.forEach(session => {
        localStorage.removeItem(`bappa_messages_${session.id}`)
      })
    }
  }
}

export const chatService = ChatService.getInstance()
