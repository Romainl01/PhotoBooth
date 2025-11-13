'use client'

import { useUser } from '@/contexts/UserContext'

/**
 * CreditBadge - Displays user's remaining credits with color-coded status
 *
 * Features:
 * - Liquid glass effect (backdrop-filter blur + transparency)
 * - Color-coded based on credit count:
 *   - Green (#21FA37): Healthy (>10 credits)
 *   - Yellow (#FAB617): Warning (4-10 credits)
 *   - Red (#FF0000): Critical (1-3 credits)
 * - Text adapts for free tier: "5 free images left" vs "X credits left"
 *
 * Usage:
 * <CreditBadge className="absolute top-4 right-4" />
 */
export default function CreditBadge({ className = '' }) {
  const { profile, loading } = useUser()

  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <div
        className={`
          inline-flex items-center justify-center
          px-3 py-2.5 rounded-2xl
          transition-all duration-200
          ${className}
        `}
        style={{
          background: 'rgba(35, 35, 35, 0.6)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <p className="font-dm-mono text-xs font-medium whitespace-nowrap text-white/50">
          Loading...
        </p>
      </div>
    )
  }

  // Show even if profile doesn't exist (default to 0 credits)
  const credits = profile?.credits ?? 0
  const totalGenerated = profile?.total_generated ?? 0

  // 🔍 DEBUG: Log what CreditBadge receives
  console.log('🔍 [DEBUG] CreditBadge - profile:', profile)
  console.log('🔍 [DEBUG] CreditBadge - credits:', credits)
  console.log('🔍 [DEBUG] CreditBadge - profile.credits:', profile?.credits)

  /**
   * Get badge text color based on credit count
   * Matches Figma designs exactly
   */
  const getColor = () => {
    if (credits <= 0) return '#FF0000' // Red (should never show due to paywall)
    if (credits <= 3) return '#FF0000' // Red - critical
    if (credits <= 10) return '#FAB617' // Yellow - warning
    return '#21FA37' // Green - healthy
  }

  /**
   * Get badge text
   * Shows "free images" for users who haven't purchased yet
   */
  const getText = () => {
    // If user has 5 credits and never generated, show "free images"
    const isFreeUser = credits === 5 && totalGenerated === 0

    if (isFreeUser) {
      return `${credits} free images left`
    }

    return `${credits} credit${credits === 1 ? '' : 's'} left`
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center
        px-4 py-2 rounded-full
        transition-all duration-300
        ${className}
      `}
      style={{
        // Enhanced liquid glass effect with better contrast
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)', // Safari support
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
      }}
    >
      <p
        className="font-dm-mono text-sm font-medium whitespace-nowrap tracking-wide"
        style={{
          color: getColor(),
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
        }}
      >
        {getText()}
      </p>
    </div>
  )
}
