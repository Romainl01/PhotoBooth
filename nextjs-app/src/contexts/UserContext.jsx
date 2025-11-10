'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Create context with default values
const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshCredits: async () => {},
})

/**
 * UserProvider - Global state management for user authentication and profile data
 *
 * This context provides:
 * - user: Supabase auth user object (id, email, metadata)
 * - profile: Database profile with credits count
 * - loading: Boolean indicating if initial load is complete
 * - refreshCredits: Function to manually refresh profile data
 *
 * Benefits of using Context:
 * - Single source of truth for user data
 * - Automatic updates when auth state changes
 * - Avoids prop drilling through components
 * - Integrates with Supabase's realtime auth listener
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  /**
   * Fetch user's profile from database
   * @param {string} userId - Supabase auth user ID
   */
  const fetchProfile = useCallback(async (userId) => {
    try {
      console.log('[UserContext] Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[UserContext] Error fetching profile:', error)
        console.error('[UserContext] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        return null
      }

      console.log('[UserContext] Profile fetched successfully:', data)
      setProfile(data)
      return data
    } catch (error) {
      console.error('[UserContext] Unexpected error fetching profile:', error)
      return null
    }
  }, [supabase])

  /**
   * Refresh credits - call this after purchases or generations
   * Public API for components to trigger manual refresh
   */
  const refreshCredits = useCallback(async () => {
    if (user?.id) {
      return await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  // Initialize: Get initial session and set up auth listener
  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
      }

      setLoading(false)
    })

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('[UserContext] Auth event:', event)

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          // User signed out
          setProfile(null)
        }
      }
    )

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const value = {
    user,
    profile,
    loading,
    refreshCredits,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * useUser - Hook to access user context
 *
 * Usage:
 * const { user, profile, loading, refreshCredits } = useUser()
 *
 * Example:
 * if (loading) return <Spinner />
 * if (!user) return <SignInPrompt />
 * return <div>Credits: {profile?.credits}</div>
 */
export function useUser() {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
