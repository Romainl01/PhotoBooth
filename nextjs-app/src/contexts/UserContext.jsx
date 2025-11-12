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
 * Retry a function with exponential backoff
 * Pure utility function - moved outside component to prevent unnecessary re-renders
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Result of function or null
 */
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()
      if (result) return result

      // If result is null but no error, wait and retry
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000) // 1s, 2s, 4s, max 8s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`[Retry] Attempt ${attempt + 1} failed:`, error)
      if (attempt === maxRetries - 1) {
        throw error // Final attempt failed
      }
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return null
}

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
  const [profileError, setProfileError] = useState(null)
  const supabase = createClient()

  /**
   * Fetch user's profile from database (with retry logic)
   * @param {string} userId - Supabase auth user ID
   */
  const fetchProfile = useCallback(async (userId) => {
    const result = await retryWithBackoff(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('[UserContext] Error fetching profile:', error)
          return null
        }

        setProfile(data)
        setProfileError(null) // Clear any previous errors
        return data
      } catch (error) {
        console.error('[UserContext] Unexpected error fetching profile:', error)
        return null
      }
    }, 3) // 3 retry attempts

    if (!result) {
      setProfileError('Unable to load your profile. Please refresh the page.')
    }

    return result
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
    profileError,
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
