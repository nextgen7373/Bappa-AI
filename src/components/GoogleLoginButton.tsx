import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth()
  
  return (
    <motion.button
      onClick={signInWithGoogle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        scale: 1.05, 
        y: -3,
        boxShadow: "0 25px 50px -12px rgba(255, 110, 25, 0.4)"
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative px-10 py-5 rounded-3xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white font-bold text-lg shadow-premium hover:shadow-glow transition-all duration-300 overflow-hidden border-2 border-white/20"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Button content */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Google icon with animation */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </motion.div>
        
        {/* Button text */}
        <span className="font-bold tracking-wide">Continue with Google</span>
        
        {/* Arrow icon */}
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-5"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.div>
      </div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  )
}
