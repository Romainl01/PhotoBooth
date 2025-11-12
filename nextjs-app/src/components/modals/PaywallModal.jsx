'use client'

import { useState, useEffect } from 'react'
import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'
import CaptureIcon from '@/components/icons/CaptureIcon'
import { DEFAULT_CREDIT_PACKAGES } from '@/lib/creditPackages'

/**
 * PaywallModal - Blocks camera when user has 0 credits
 *
 * Phase 2B Update: Now displays 3 credit packages with Stripe checkout
 *
 * Design:
 * - Full-screen white/light backdrop with blur
 * - Centered dark card with rounded corners
 * - Camera blocked icon (📷🚫) with red indicator
 * - Motivational copy: "Don't stop now! Your best picture might be next"
 * - 3 credit package buttons: Starter (10), Creator (30), Pro (100)
 *
 * Performance:
 * - Zero loading state (optimistic UI pattern)
 * - Initializes with DEFAULT_CREDIT_PACKAGES constants
 * - Background sync with database for price updates
 *
 * Props:
 * - onClose: function - Close modal (optional, for backdrop click)
 *
 * Purchase Flow:
 * 1. User clicks a credit package button
 * 2. Modal calls /api/checkout with price_id
 * 3. API returns Stripe checkout URL
 * 4. User redirects to Stripe payment page
 * 5. After payment, Stripe webhook adds credits
 * 6. User redirects back to app
 */
export default function PaywallModal({ onClose }) {
  // Initialize with constants for instant UI (zero loading state)
  const [packages, setPackages] = useState(DEFAULT_CREDIT_PACKAGES)
  const [processingPackageId, setProcessingPackageId] = useState(null)

  // Optional: Sync packages from database in background (silently updates if prices change)
  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/credit-packages')
        if (!response.ok) throw new Error('Failed to fetch packages')
        const data = await response.json()
        setPackages(data.packages)
      } catch (error) {
        console.error('[PaywallModal] Error fetching packages:', error)
        // No need for fallback - already initialized with hardcoded values
      }
    }

    fetchPackages()
  }, [])

  // Handle credit package purchase
  async function handlePurchase(priceId, packageId) {
    try {
      setProcessingPackageId(packageId)

      // Call checkout API to create Stripe session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('[PaywallModal] Checkout error:', error)
      alert(`Error: ${error.message}`)
      setProcessingPackageId(null)
    }
  }

  // Format price for display
  function formatPrice(cents, currency) {
    const amount = (cents / 100).toFixed(2)
    const symbol = currency === 'EUR' ? '€' : '$'
    return `${amount}${symbol}`
  }
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
          {/* Camera blocked icon */}
          <div className="w-[88px] h-[88px]">
            <CaptureIcon className="w-full h-full" iconType="no-camera" />
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-6 w-full">
            <h2 className="font-ibm-plex-mono font-bold text-2xl text-white leading-snug">
              Don't stop now!
            </h2>
            <p className="font-ibm-plex-mono font-medium text-base text-white leading-relaxed">
              Your best picture might be next
            </p>
          </div>

          {/* Credit Package Buttons */}
          <div className="flex flex-col gap-4 w-full">
            {packages.map((pkg, index) => (
              <SkeuomorphicRectButton
                key={pkg.id || index}
                width={318}
                height={56}
                gradientId={`paywall-package-${index}`}
                onClick={() => handlePurchase(pkg.stripe_price_id, pkg.id)}
                disabled={processingPackageId === pkg.id}
                className="w-full"
              >
                <span className="font-ibm-plex-mono font-medium text-base text-white">
                  {pkg.emoji} {pkg.name}: {pkg.credits} images - {formatPrice(pkg.price_cents, pkg.currency)}
                </span>
              </SkeuomorphicRectButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
