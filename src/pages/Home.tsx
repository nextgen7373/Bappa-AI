import React from 'react'
import { motion } from 'framer-motion'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Home(){
  const { user } = useAuth()
  
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
        
        {/* Action Button */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          {user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                to="/chat" 
                className="group relative px-10 py-5 rounded-3xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white font-bold text-lg shadow-premium hover:shadow-glow transition-all duration-300 overflow-hidden border-2 border-white/20 inline-flex items-center gap-4"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Button content */}
                <div className="relative flex items-center gap-4">
                  {/* Chat icon with animation - using original emoji color */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="text-2xl"
                  >
                    💬
                  </motion.div>
                  
                  {/* Button text */}
                  <span className="font-bold tracking-wide">Start Chatting with Bappa</span>
                  
                  {/* Arrow icon */}
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-5 h-5"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <GoogleLoginButton />
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
