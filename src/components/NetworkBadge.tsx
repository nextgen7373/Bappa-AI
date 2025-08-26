import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOffline } from '../context/OfflineContext'

export default function NetworkBadge() {
  const { isOffline } = useOffline()

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.5
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg border border-white/20 backdrop-blur-sm">
            {/* Animated Network Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-lg"
            >
              📡
            </motion.div>
            
            {/* Status Text */}
            <span className="text-sm font-medium">You're offline</span>
            
            {/* Loading Dots */}
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
