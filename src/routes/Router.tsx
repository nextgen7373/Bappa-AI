import React from 'react'
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from '../pages/Home'
import Chat from '../pages/Chat'
import NotFound from '../pages/NotFound'
import ProtectedRoute from '../components/ProtectedRoute'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ParallaxBg from '../components/ParallaxBg'
import NetworkBadge from '../components/NetworkBadge'
import OfflineIntegration from '../components/OfflineIntegration'

function RouterContent() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent-cream to-accent-warm relative">
      <ParallaxBg />
      <Header />
      <NetworkBadge />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      
      {/* Offline Fallback Integration */}
      <OfflineIntegration />
    </div>
  )
}

export default function Router() {
  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  )
}
