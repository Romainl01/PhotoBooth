'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'
import IconButton from '@/components/ui/IconButton'
import CloseIcon from '@/components/icons/CloseIcon'
import PaywallModal from '@/components/modals/PaywallModal'

const SUPABASE_AUTH_STORAGE_KEYS = getSupabaseAuthStorageKeys()
const E2E_USER_STORAGE_KEY = '__e2e_user__'
const E2E_PROFILE_STORAGE_KEY = '__e2e_profile__'
const E2E_AUTH_EVENT_NAME = 'e2e-auth-changed'

/**
 * SettingsDrawer - Full-screen settings panel with user info and actions
 *
 * Layout (3 sections):
 * 1. User: Shows name/email, credit count (color-coded), Buy credits button
 * 2. About: Creator info, Contact button (links to LinkedIn)
 * 3. Account: Log out button
 *
 * Props:
 * - isOpen: boolean - Controls visibility
 * - onClose: function - Close drawer callback
 *
 * Features:
 * - Full-screen overlay (dark background)
 * - Scrollable content for small screens
 * - Color-coded credits display (green/yellow/red)
 * - Graceful fallback for missing user metadata
 *
 * Usage:
 * const [showSettings, setShowSettings] = useState(false)
 * <SettingsDrawer isOpen={showSettings} onClose={() => setShowSettings(false)} />
 */
export default function SettingsDrawer({ isOpen, onClose }) {
  const { user, profile } = useUser()
  const supabase = createClient()
  const [showPaywallModal, setShowPaywallModal] = useState(false)

  /**
   * Handle logout - sign out and redirect to sign-in page
   */
  const handleLogout = async () => {
    console.log('[SettingsDrawer] Logging out user...')

    try {
      // Wait for sign out to complete before redirecting
      // This prevents middleware from seeing stale auth state
      await supabase.auth.signOut()
      console.log('[SettingsDrawer] Sign out successful')
    } catch (err) {
      // Log error but continue with redirect
      // Middleware will handle any remaining session cleanup
      console.error('[SettingsDrawer] Sign out error:', err)
    }

    // Ensure session artifacts are removed even if Supabase is unreachable
    clearSupabaseLocalStorage()
    await clearSupabaseCookies()
    clearE2EAuthState()

    // Redirect to sign-in page after session is cleared
    console.log('[SettingsDrawer] Redirecting to sign-in...')
    window.location.href = '/sign-in'
  }

  /**
   * Handle buy credits - opens PaywallModal
   */
  const handleBuyCredits = () => {
    console.log('[SettingsDrawer] Opening paywall modal')
    setShowPaywallModal(true)
  }

  /**
   * Handle contact me - opens LinkedIn (user confirmed it's already implemented)
   */
  const handleContactMe = () => {
    // User mentioned this is already coded and links to LinkedIn
    window.open('https://www.linkedin.com/in/romain-lagrange1/', '_blank')
  }

  // Don't render if not open
  if (!isOpen) return null

  // Get credits and determine color
  const credits = profile?.credits ?? 0
  const getCreditsColor = () => {
    if (credits <= 3) return '#FF0000' // Red - critical
    if (credits <= 10) return '#FAB617' // Yellow - warning
    return '#21FA37' // Green - healthy
  }

  // Get display name from user metadata or email
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split('@')[0]
    }
    return 'there'
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#242424]">
      {/* Scrollable content container */}
      <div className="h-full overflow-y-auto flex flex-col p-4 gap-4">
        {/* Close button - top right */}
        <div className="flex justify-end">
          <IconButton variant="nav" onClick={onClose} ariaLabel="Close settings">
            <CloseIcon className="w-full h-full" />
          </IconButton>
        </div>

        {/* User Section */}
        <div
          className="bg-[#424141] rounded-2xl p-4 flex flex-col gap-4"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <h2 className="font-crimson-pro font-bold text-3xl text-white leading-snug">
            User
          </h2>

          <div className="flex flex-col gap-4">
            <p className="font-ibm-plex-mono font-medium text-base text-white">
              Hi {getDisplayName()} 👋,
            </p>

            <p className="font-dm-mono text-base">
              <span className="text-white">You have </span>
              <span style={{ color: getCreditsColor() }}>
                {credits} credit{credits === 1 ? '' : 's'} left
              </span>
            </p>
          </div>

          <div className="w-full h-[56px]">
            <SkeuomorphicRectButton
              width={334}
              height={56}
              gradientId="settings-buy-credits-gradient"
              onClick={handleBuyCredits}
              className="w-full h-[56px]"
            >
              <span className="font-ibm-plex-mono font-medium text-base text-white">
                Buy credits
              </span>
            </SkeuomorphicRectButton>
          </div>
        </div>

        {/* About Section */}
        <div
          className="bg-[#424141] rounded-2xl p-4 flex flex-col gap-4"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <h2 className="font-crimson-pro font-bold text-3xl text-white leading-snug">
            About
          </h2>

          <p className="font-ibm-plex-mono font-medium text-base text-white">
            Made with 🫶 by Romain Lagrange
          </p>

          <div className="w-full h-[56px]">
            <SkeuomorphicRectButton
              width={334}
              height={56}
              gradientId="settings-contact-gradient"
              onClick={handleContactMe}
              className="w-full h-[56px]"
            >
              <span className="font-ibm-plex-mono font-medium text-base text-white">
                Contact me
              </span>
            </SkeuomorphicRectButton>
          </div>
        </div>

        {/* Account Section */}
        <div
          className="bg-[#424141] rounded-2xl p-4 flex flex-col gap-4"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <h2 className="font-crimson-pro font-bold text-3xl text-white leading-snug">
            Account
          </h2>

          <div className="w-full h-[56px]">
            <SkeuomorphicRectButton
              width={334}
              height={56}
              gradientId="settings-logout-gradient"
              onClick={handleLogout}
              className="w-full h-[56px]"
              data-testid="logout-button"
            >
              <span className="font-ibm-plex-mono font-medium text-base text-white">
                Log out
              </span>
            </SkeuomorphicRectButton>
          </div>
        </div>
      </div>

      {/* Paywall Modal - rendered above settings drawer */}
      {showPaywallModal && (
        <PaywallModal onClose={() => setShowPaywallModal(false)} />
      )}
    </div>
  )
}

function clearSupabaseLocalStorage() {
  if (typeof window === 'undefined') return

  try {
    SUPABASE_AUTH_STORAGE_KEYS.forEach(key => {
      window.localStorage.removeItem(key)
    })
  } catch (error) {
    console.warn('[SettingsDrawer] Failed to clear auth storage:', error)
  }
}

async function clearSupabaseCookies() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
  } catch (error) {
    console.warn('[SettingsDrawer] Failed to clear auth cookies:', error)
  }
}

function clearE2EAuthState() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(E2E_USER_STORAGE_KEY)
    window.localStorage.removeItem(E2E_PROFILE_STORAGE_KEY)
    window.dispatchEvent(new Event(E2E_AUTH_EVENT_NAME))
  } catch (error) {
    console.warn('[SettingsDrawer] Failed to clear E2E auth state:', error)
  }
}

function getSupabaseAuthStorageKeys() {
  const keys = ['supabase.auth.token']
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  if (supabaseUrl) {
    try {
      const host = new URL(supabaseUrl).host
      const projectRef = host.split('.')[0]
      if (projectRef) {
        keys.push(`sb-${projectRef}-auth-token`)
      }
    } catch (error) {
      console.warn('[SettingsDrawer] Invalid Supabase URL, skipping storage key inference:', error)
    }
  }

  return keys
}
