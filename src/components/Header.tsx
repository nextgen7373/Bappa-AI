import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import HealthCheck from './HealthCheck'

export default function Header() {
  const { user, signOut } = useAuth()
  
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-premium"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/assets/face image.jpg" 
                alt="Bappa.ai" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-premium" 
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Bappa.ai
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">AI-powered spiritual guidance</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Health Check - Only show for authenticated users */}
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="hidden md:block"
              >
                <HealthCheck />
              </motion.div>
            )}
            
            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link 
                    to="/chat" 
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-brand-primary font-medium hover:text-brand-dark transition-colors duration-200"
                  >
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                    Chat with Bappa
                  </Link>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={signOut}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium shadow-premium hover:shadow-glow transition-all duration-300 btn-premium focus-ring"
                >
                  Sign out
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  to="/" 
                  className="px-4 py-2.5 text-brand-primary font-medium hover:text-brand-dark transition-colors duration-200 focus-ring rounded-lg"
                >
                  Home
                </Link>
              </motion.div>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
