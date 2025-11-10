'use client'

import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'

/**
 * PaywallModal - Blocks camera when user has 0 credits
 *
 * Design:
 * - Full-screen white/light backdrop with blur
 * - Centered dark card with rounded corners
 * - Camera blocked icon (📷🚫) with red indicator
 * - Motivational copy: "Don't stop now! Your best picture might be next"
 * - CTA button: "Add credits"
 *
 * Props:
 * - onClose: function - Close modal (optional, for backdrop click)
 * - onBuyCredits: function - Navigate to purchase flow
 *
 * Usage:
 * {showPaywall && (
 *   <PaywallModal
 *     onClose={() => setShowPaywall(false)}
 *     onBuyCredits={() => router.push('/credits')}
 *   />
 * )}
 */
export default function PaywallModal({ onClose, onBuyCredits }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur - matches Figma white overlay */}
      <div
        className="absolute inset-0 bg-white/90 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal card - centered dark content */}
      <div
        className="relative bg-[#242424] rounded-[24px] p-4 max-w-[350px] w-full shadow-2xl"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Camera blocked icon - matches Figma circular icon with red dot */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-[88px] h-[88px] rounded-full bg-[#333333] flex items-center justify-center shadow-lg"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Camera blocked emoji */}
              <span className="text-5xl select-none" role="img" aria-label="Camera blocked">
                📷🚫
              </span>
            </div>

            {/* Red indicator dot - bottom right */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full"
              style={{
                boxShadow: '0 0 8px rgba(255, 0, 0, 0.6)',
              }}
            />
          </div>

          {/* Copy - matches Figma text styles */}
          <div className="flex flex-col gap-6 w-full">
            <h2 className="font-ibm-plex-mono font-bold text-2xl text-white leading-snug">
              Don't stop now!
            </h2>
            <p className="font-ibm-plex-mono font-medium text-base text-white leading-relaxed">
              Your best picture might be next
            </p>
          </div>

          {/* CTA Button */}
          <SkeuomorphicRectButton
            width={318} // ~350px card - 32px padding
            height={56}
            gradientId="paywall-button-gradient"
            onClick={onBuyCredits}
            className="w-full"
          >
            <span className="font-ibm-plex-mono font-medium text-base text-white">
              Add credits
            </span>
          </SkeuomorphicRectButton>
        </div>
      </div>
    </div>
  )
}
