import React from 'react'
import { motion } from 'framer-motion'

export default function Loader(){
  return (
    <div className="grid place-items-center h-[60vh]">
      <div className="text-center space-y-6">
        {/* Main Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16 mx-auto"
        >
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
        </motion.div>
        
        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold text-gray-800">Loading Bappa.ai</h3>
          <p className="text-sm text-gray-500">Preparing your spiritual journey...</p>
        </motion.div>
        
        {/* Floating Elements */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-brand-primary"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
