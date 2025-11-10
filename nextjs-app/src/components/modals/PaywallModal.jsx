'use client'

import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'
import CaptureIcon from '@/components/icons/CaptureIcon'

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
      {/* Backdrop with blur - dark overlay to dim camera screen */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
          {/* Camera blocked icon - uses same icon as CameraAccessError */}
          <div className="w-[88px] h-[88px]">
            <CaptureIcon className="w-full h-full" iconType="no-camera" />
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
