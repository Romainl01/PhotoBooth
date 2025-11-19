'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Create context with default values
const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshCredits: async () => {},
  updateCredits: (credits) => {},
})

const E2E_USER_STORAGE_KEY = '__e2e_user__'
const E2E_PROFILE_STORAGE_KEY = '__e2e_profile__'
const E2E_AUTH_EVENT_NAME = 'e2e-auth-changed'
const PROFILE_CACHE_KEY = '__morpheo_profile_cache__'
const isE2ETestMode = process.env.NEXT_PUBLIC_E2E_DISABLE_AUTH === 'true'

/**
 * Retry a function with exponential backoff (OPTIMIZED for faster loading)
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
        // OPTIMIZED: Faster delays - 300ms, 600ms, 1200ms (instead of 1s, 2s, 4s)
        const delay = Math.min(300 * Math.pow(2, attempt), 1200)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`[Retry] Attempt ${attempt + 1} failed:`, error)
      if (attempt === maxRetries - 1) {
        throw error // Final attempt failed
      }
      // Wait before retrying with faster delays
      const delay = Math.min(300 * Math.pow(2, attempt), 1200)
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
  const disableAuthForTests = isE2ETestMode

  /**
   * Fetch user's profile from database (with retry logic and timeout)
   * OPTIMIZED: Faster timeout (500ms) and caching for instant reload
   * @param {string} userId - Supabase auth user ID
   */
  const fetchProfile = useCallback(async (userId) => {
    const result = await retryWithBackoff(async () => {
      try {
        // OPTIMIZED: 500ms timeout (instead of 2s) for faster failure detection
        // JWT token propagation is usually <500ms after OAuth redirect
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 500)
        )

        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        const { data, error } = await Promise.race([queryPromise, timeoutPromise])

        if (error) {
          console.error('[UserContext] Error fetching profile:', error)
          return null
        }

        setProfile(data)
        setProfileError(null)

        // OPTIMIZED: Cache profile for instant load on next visit
        cacheProfile(data)

        return data
      } catch (error) {
        console.error('[UserContext] Unexpected error fetching profile:', error)
        return null
      }
    }, 3) // 3 retry attempts with exponential backoff

    if (!result) {
      console.error('[UserContext] Failed to fetch profile after retries')
      setProfileError('Unable to load your profile. Please refresh the page.')
    }

    return result
  }, [supabase])

  useEffect(() => {
    if (!disableAuthForTests) return undefined

    let mounted = true

    const syncFromStorage = () => {
      if (!mounted) return
      const { storedUser, storedProfile } = readE2EAuthState()
      setUser(storedUser)
      setProfile(storedProfile)
      setProfileError(null)
      setLoading(false)
    }

    syncFromStorage()

    const handleAuthChange = () => syncFromStorage()

    window.addEventListener(E2E_AUTH_EVENT_NAME, handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      mounted = false
      window.removeEventListener(E2E_AUTH_EVENT_NAME, handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [disableAuthForTests])

  /**
   * Refresh credits - call this after purchases or generations
   * Public API for components to trigger manual refresh
   * OPTIMIZED: Also updates cache
   */
  const refreshCredits = useCallback(async () => {
    console.log('[UserContext] refreshCredits called')

    if (disableAuthForTests) {
      const { storedProfile } = readE2EAuthState()
      setProfile(storedProfile)
      return storedProfile
    }

    // Don't rely on stale user state - get fresh session
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.id) {
      console.log('[UserContext] Got fresh session, fetching profile for user:', session.user.id)
      const result = await fetchProfile(session.user.id)
      console.log('[UserContext] refreshCredits completed, new credits:', result?.credits)
      // fetchProfile already caches the result
      return result
    } else {
      console.warn('[UserContext] refreshCredits called but no active session found')
    }
  }, [disableAuthForTests, supabase, fetchProfile])

  /**
   * Update credits directly without fetching from DB
   * Use when you already have the authoritative credit count (e.g., from API response)
   * OPTIMIZED: Also updates cache for consistency
   * @param {number} credits - The new credit count
   */
  const updateCredits = useCallback((credits) => {
    console.log('[UserContext] updateCredits called with:', credits)

    if (typeof credits !== 'number') {
      console.warn('[UserContext] updateCredits called with non-number value:', credits)
      return
    }

    setProfile(prev => {
      if (!prev) {
        console.warn('[UserContext] Cannot update credits - no profile exists')
        return prev
      }
      const updatedProfile = { ...prev, credits }

      // OPTIMIZED: Update cache to keep it in sync
      cacheProfile(updatedProfile)

      if (disableAuthForTests) {
        persistE2EProfile(updatedProfile)
      }
      return updatedProfile
    })
  }, [disableAuthForTests])

  // Initialize: Get initial session and set up auth listener
  useEffect(() => {
    if (disableAuthForTests) return undefined

    let mounted = true
    let initialLoadHandled = false

    // OPTIMIZED: Load cached profile immediately for instant display
    // Background fetch will update with fresh data
    const cachedProfile = readCachedProfile()
    if (cachedProfile) {
      console.log('[UserContext] Loading cached profile for instant display')
      setProfile(cachedProfile)
      // Note: loading stays true because we still need fresh data
    }

    // Safety timeout: if nothing happens after 10s, stop loading
    const safetyTimeout = setTimeout(() => {
      if (!initialLoadHandled && mounted) {
        console.log('[UserContext] Safety timeout reached, clearing loading state')
        setLoading(false)
        initialLoadHandled = true
      }
    }, 10000)

    // Listen for auth changes (sign in, sign out, token refresh)
    // This fires immediately on mount with current session if one exists
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        console.log('[UserContext] Auth state change:', _event, session ? 'session exists' : 'no session')

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          // User signed out - clear profile and cache
          setProfile(null)
          clearProfileCache() // OPTIMIZED: Clear cache on logout
        }

        // Mark initial load as handled and clear loading
        if (!initialLoadHandled) {
          initialLoadHandled = true
          clearTimeout(safetyTimeout)
          setLoading(false)
        }
      }
    )

    // Handle bfcache (back/forward cache) restore
    // When user navigates back from Stripe, browser may restore page from cache
    // This ensures we refresh credits instead of showing stale/frozen state
    const handlePageShow = async (event) => {
      if (event.persisted) {
        console.log('[UserContext] Page restored from bfcache, getting fresh session')
        // Get fresh session to refresh the profile
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          await fetchProfile(session.user.id)
        }
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [disableAuthForTests, supabase, fetchProfile])

  const value = {
    user,
    profile,
    loading,
    refreshCredits,
    updateCredits,
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

function readE2EAuthState() {
  if (typeof window === 'undefined') {
    return { storedUser: null, storedProfile: null }
  }

  const storedUser = safeParseJSON(localStorage.getItem(E2E_USER_STORAGE_KEY))
  const storedProfile = safeParseJSON(localStorage.getItem(E2E_PROFILE_STORAGE_KEY))

  return { storedUser, storedProfile }
}

function persistE2EProfile(profile) {
  if (typeof window === 'undefined') return

  try {
    if (profile) {
      localStorage.setItem(E2E_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } else {
      localStorage.removeItem(E2E_PROFILE_STORAGE_KEY)
    }
    window.dispatchEvent(new Event(E2E_AUTH_EVENT_NAME))
  } catch (error) {
    console.warn('[UserContext] Failed to persist E2E profile:', error)
  }
}

function safeParseJSON(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * Cache management for profile data (Performance optimization)
 * Provides instant load on return visits while fetching fresh data in background
 */

/**
 * Read cached profile from localStorage
 * @returns {Object|null} Cached profile or null
 */
function readCachedProfile() {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached)

    // Validate cache structure
    if (!parsed.profile || !parsed.timestamp) return null

    // Optional: Add cache expiry (e.g., 24 hours)
    // const MAX_AGE = 24 * 60 * 60 * 1000
    // if (Date.now() - parsed.timestamp > MAX_AGE) return null

    console.log('[Cache] Loaded cached profile:', parsed.profile.credits, 'credits')
    return parsed.profile
  } catch (error) {
    console.warn('[Cache] Failed to read cache:', error)
    return null
  }
}

/**
 * Cache profile to localStorage
 * @param {Object} profile - Profile object to cache
 */
function cacheProfile(profile) {
  if (typeof window === 'undefined' || !profile) return

  try {
    const cacheData = {
      profile,
      timestamp: Date.now(),
    }
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData))
    console.log('[Cache] Cached profile:', profile.credits, 'credits')
  } catch (error) {
    // localStorage might be full or disabled - graceful fallback
    console.warn('[Cache] Failed to cache profile:', error)
  }
}

/**
 * Clear cached profile (call on logout)
 */
function clearProfileCache() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(PROFILE_CACHE_KEY)
    console.log('[Cache] Cleared profile cache')
  } catch (error) {
    console.warn('[Cache] Failed to clear cache:', error)
  }
}
