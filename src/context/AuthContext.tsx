import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import { useOffline } from './OfflineContext'

interface AuthCtx { 
  user: any | null; 
  loading: boolean; 
  signInWithGoogle: () => Promise<void>; 
  signOut: () => Promise<void>;
  getAuthToken: () => string | null;
  refreshAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const { triggerFallback, isOffline } = useOffline()

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        if (isOffline) {
          triggerFallback("You're offline. Please check your connection to sign in.", false)
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.getUser()
        console.log('🔍 AuthContext: getUser result:', { user: data.user, error })
        if (error) {
          console.error('Auth error:', error)
          triggerFallback("Authentication service is unavailable. Please try again later.", true)
        } else {
          console.log('🔍 AuthContext: Setting user:', data.user)
          setUser(data.user ?? null)
        }
      } catch (error) {
        console.error('Auth error:', error)
        triggerFallback("Bappa is experiencing some difficulties. Please try again in a moment.", true)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (isOffline) {
          // Don't update user state when offline
          return
        }
        
        setUser(session?.user ?? null)
        
        // Generate JWT token when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          await refreshAuthToken()
        }
        
        // Clear JWT token when user signs out
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('bappa_auth_token')
          sessionStorage.removeItem('bappa_auth_token')
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        triggerFallback("Authentication service is unavailable. Please try again later.", true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isOffline, triggerFallback])

  const signInWithGoogle = async () => {
    try {
      if (isOffline) {
        triggerFallback("You're offline. Please check your internet connection to sign in.", true)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) {
        console.error('Google sign-in error:', error)
        triggerFallback("Unable to sign in with Google. Please try again.", true)
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      triggerFallback("Bappa is experiencing some difficulties. Please try again in a moment.", true)
    }
  }

  const signOut = async () => {
    try {
      if (isOffline) {
        triggerFallback("You're offline. Please check your connection to sign out.", true)
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        triggerFallback("Unable to sign out. Please try again.", true)
      }
      
      // Clear JWT token on sign out
      localStorage.removeItem('bappa_auth_token')
      sessionStorage.removeItem('bappa_auth_token')
    } catch (error) {
      console.error('Sign out error:', error)
      triggerFallback("Bappa is experiencing some difficulties. Please try again in a moment.", true)
    }
  }

  // Get JWT token from storage
  const getAuthToken = (): string | null => {
    return localStorage.getItem('bappa_auth_token') || sessionStorage.getItem('bappa_auth_token')
  }

  // Generate JWT token from Supabase session
  const refreshAuthToken = async (): Promise<string | null> => {
    try {
      if (isOffline) {
        return null
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        return null
      }

      // Generate a simple JWT-like token for the backend
      // In production, this should be done server-side
      const tokenData = {
        userId: session.user.id,
        email: session.user.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
        iat: Math.floor(Date.now() / 1000)
      }

      // Simple base64 encoding (in production, use proper JWT signing)
      const token = btoa(JSON.stringify(tokenData))
      
      // Store token
      localStorage.setItem('bappa_auth_token', token)
      
      return token
    } catch (error) {
      console.error('Token refresh error:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getAuthToken, refreshAuthToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
