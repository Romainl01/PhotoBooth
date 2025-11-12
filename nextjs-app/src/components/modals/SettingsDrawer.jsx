'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'
import IconButton from '@/components/ui/IconButton'
import CloseIcon from '@/components/icons/CloseIcon'

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
  const router = useRouter()
  const { user, profile } = useUser()
  const supabase = createClient()

  /**
   * Handle logout - sign out and redirect to sign-in page
   */
  const handleLogout = async () => {
    console.log('[SettingsDrawer] Logging out user...')

    // Start sign out but don't wait for it - redirect immediately
    supabase.auth.signOut().catch(err => {
      console.error('[SettingsDrawer] Sign out error (non-blocking):', err)
    })

    // Force immediate redirect - let middleware handle the rest
    console.log('[SettingsDrawer] Redirecting to sign-in...')
    window.location.href = '/sign-in'
  }

  /**
   * Handle buy credits - placeholder for Phase 2B
   */
  const handleBuyCredits = () => {
    // TODO Phase 2B: Navigate to Stripe checkout
    console.log('[SettingsDrawer] Buy credits clicked - Stripe integration pending')
    alert('Payment integration coming soon! 💳')
  }

  /**
   * Handle contact me - opens LinkedIn (user confirmed it's already implemented)
   */
  const handleContactMe = () => {
    // User mentioned this is already coded and links to LinkedIn
    window.open('https://www.linkedin.com/in/romain-lagrange/', '_blank')
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
            >
              <span className="font-ibm-plex-mono font-medium text-base text-white">
                Log out
              </span>
            </SkeuomorphicRectButton>
          </div>
        </div>
      </div>
    </div>
  )
}
