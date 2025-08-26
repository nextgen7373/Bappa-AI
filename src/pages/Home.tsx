import React from 'react'
import { motion } from 'framer-motion'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useAuth } from '../context/AuthContext'
import { Link, Navigate } from 'react-router-dom'

export default function Home(){
  const { user } = useAuth()
  
  // If user is already logged in, redirect to chat
  if (user) {
    return <Navigate to="/chat" replace />
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-brand-secondary/10 to-brand-primary/10 rounded-full blur-3xl"
        />
      </div>
      
      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-gray-800">🙏</span>{' '}
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent">
              Welcome to Bappa.ai
            </span>
          </motion.h1>
        </motion.div>
        
        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 font-medium"
        >
          Experience AI-powered spiritual guidance and wisdom
        </motion.p>
        
        {/* Tagline */}
        <motion.p 
          variants={itemVariants}
          className="text-sm sm:text-base text-gray-500 mb-12 font-light"
        >
          Made with ❤️ by NextGen World
        </motion.p>
        
        {/* Action Button - Only show Google Login for non-authenticated users */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <GoogleLoginButton />
        </motion.div>
      </motion.div>
    </section>
  )
}
