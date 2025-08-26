import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OfflineFallbackProps {
  isVisible: boolean
  onDismiss?: () => void
  message?: string
  showDismissButton?: boolean
}

export default function OfflineFallback({ 
  isVisible, 
  onDismiss, 
  message = "Bappa is meditating right now. Please try again soon.",
  showDismissButton = true 
}: OfflineFallbackProps) {
  const [isDismissing, setIsDismissing] = useState(false)

  const handleDismiss = () => {
    if (onDismiss) {
      setIsDismissing(true)
      setTimeout(() => {
        onDismiss()
        setIsDismissing(false)
      }, 300)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          {/* Main Overlay Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              rotate: isDismissing ? [0, -5, 5, 0] : 0
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              y: 50,
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.5
            }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5" />
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full blur-xl"
            />
            
            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-tr from-brand-secondary/20 to-brand-primary/20 rounded-full blur-xl"
            />

            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              {/* Ganpati Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className="mb-6"
              >
                <div className="text-8xl">🙏</div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-gray-800 mb-3"
              >
                Connection Lost
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-gray-600 leading-relaxed mb-6"
              >
                {message}
              </motion.p>

              {/* Blessing Text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-4 border border-brand-primary/20 mb-6"
              >
                <p className="text-sm font-medium text-brand-primary">
                  🙏 Om Gan Ganpataye Namo Namah 🙏
                </p>
                <p className="text-xs text-brand-primary/70 mt-1">
                  May Bappa's blessings guide you
                </p>
              </motion.div>

              {/* Dismiss Button */}
              {showDismissButton && onDismiss && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismiss}
                  className="w-full px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-primary/20"
                >
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Continue
                  </motion.span>
                </motion.button>
              )}
            </div>

            {/* Decorative Border */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
