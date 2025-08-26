import React, { useEffect, useRef } from 'react'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import TypingIndicator from '../components/TypingIndicator'
import Loader from '../components/Loader'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { ChatProvider } from '../context/ChatContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

function ChatContent() {
  const { messages, send, remaining, isTyping, isLoading } = useChat()
  const { user } = useAuth()
  const listRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{ 
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' }) 
  }, [messages, isTyping])

  async function handleSend(text: string){
    if(remaining<=0) return
    try { await send(text) } catch { /* offline fallback handled in contexts Day2 */ }
  }

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Loader />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">Loading Bappa's Wisdom</h3>
              <p className="text-gray-500">Preparing your spiritual journey...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Back Button - Top Left */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-40"
      >
        <Link 
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <motion.svg
            animate={{ x: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-5 text-gray-600 group-hover:text-brand-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </motion.svg>
          <span className="text-sm font-medium text-gray-600 group-hover:text-brand-primary">Back to Home</span>
        </Link>
      </motion.div>

      {/* Message Counter - Top Right */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 z-40"
      >
        <div className="px-4 py-2 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-full border border-brand-primary/20 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-primary">
              {remaining}/5
            </span>
            <span className="text-xs text-brand-primary/70">messages today</span>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden pt-20">
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
          {/* Messages Container */}
          <div 
            ref={listRef} 
            className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4"
          >
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-8"
              >
                {/* Welcome Animation */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative"
                >
                  <div className="text-7xl mb-4">🙏</div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-full blur-2xl"
                  />
                </motion.div>
                
                {/* Welcome Text - Orange Color */}
                <div className="max-w-lg space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent">
                    Welcome to Bappa.ai
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    I'm here to provide spiritual guidance and wisdom. Ask me anything about life, 
                    spirituality, or seek advice for your journey ahead.
                  </p>
                </div>
                
                {/* Start Indicator */}
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                  <span>Start your conversation below</span>
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    <ChatMessage {...message} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {/* Enhanced Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 shadow-lg"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ChatInput onSend={handleSend} disabled={remaining<=0} remaining={remaining} />
          
          {/* Enhanced Daily Limit Notice */}
          {remaining <= 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-sm">
                <span className="text-2xl">⏰</span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-600">
                    Daily limit reached
                  </p>
                  <p className="text-xs text-red-500">
                    Come back tomorrow for more wisdom!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <div className="sr-only" aria-live="polite">
        Logged in as {user?.email}
      </div>
    </div>
  )
}

export default function Chat(){
  const { user, loading } = useAuth()
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Loader />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">Loading Bappa.ai</h3>
              <p className="text-gray-500">Preparing your spiritual journey...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show sign-in prompt if no user
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-7xl mb-4">🙏</div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent">
                Welcome to Bappa.ai
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Please sign in to start your spiritual journey with Bappa.
              </p>
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <ChatProvider userId={user.id}>
      <ChatContent />
    </ChatProvider>
  )
}
