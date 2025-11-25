'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import SkeuomorphicRectButton from '@/components/ui/SkeuomorphicRectButton'
import CaptureIcon from '@/components/icons/CaptureIcon'
import CloseIcon from '@/components/icons/CloseIcon'
import { DEFAULT_CREDIT_PACKAGES } from '@/lib/creditPackages'

/**
 * PaywallModal - Responsive pack selection
 *
 * Mobile Design:
 * - Horizontal scrollable cards (240px wide) with scroll-snap and peek effect
 * - Full-screen modal
 *
 * Desktop Design (md+):
 * - Centered modal with backdrop blur
 * - All 3 cards visible side-by-side
 * - Hover effects on cards
 *
 * Features:
 * - Camera icon header with close button
 * - "Choose your pack" title
 * - Three pack cards: Start (10), Creator (30), Pro (100)
 * - "Most popular plan" badge on Creator
 * - Two-step selection: click card to select → click CTA button to checkout
 *
 * Performance:
 * - Zero loading state (optimistic UI pattern)
 * - Initializes with DEFAULT_CREDIT_PACKAGES constants
 * - Background sync with database for price updates
 *
 * Props:
 * - onClose: function - Close modal callback
 */
export default function PaywallModal({ onClose }) {
  const [packages, setPackages] = useState(DEFAULT_CREDIT_PACKAGES)
  const [selectedPackage, setSelectedPackage] = useState(DEFAULT_CREDIT_PACKAGES[1]) // Default to Creator
  const [processingCheckout, setProcessingCheckout] = useState(false)

  // Sync packages from database in background
  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/credit-packages')
        if (!response.ok) throw new Error('Failed to fetch packages')
        const data = await response.json()
        setPackages(data.packages)
        setSelectedPackage(data.packages[1]) // Update selected to Creator
      } catch (error) {
        console.error('[PaywallModal] Error fetching packages:', error)
      }
    }
    fetchPackages()
  }, [])

  // Scroll to Creator card on mount (mobile only)
  useEffect(() => {
    const timer = setTimeout(() => {
      const creatorCard = document.querySelector('[data-pack="Creator"]')
      if (creatorCard && window.innerWidth < 768) {
        creatorCard.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle checkout with selected package
  async function handleCheckout() {
    if (!selectedPackage) return

    try {
      setProcessingCheckout(true)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: selectedPackage.stripe_price_id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('[PaywallModal] Checkout error:', error)
      alert(`Error: ${error.message}`)
      setProcessingCheckout(false)
    }
  }

  // Format price for display
  function formatPrice(cents, currency) {
    const amount = (cents / 100).toFixed(2)
    if (currency === 'USD') {
      return `$${amount}` // American style: $3.99
    }
    return `${amount}€` // European style: 3.99€
  }

  return (
    <>
      {/* Backdrop - desktop only */}
      <div
        className="hidden md:block fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="paywall-backdrop"
      />

      {/* Modal container */}
      <div
        className="fixed inset-0 z-50 bg-[#242424] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[1100px] md:w-[95vw] md:max-h-[90vh] md:rounded-3xl md:shadow-2xl md:overflow-y-auto"
        data-testid="paywall-modal"
      >
        {/* Main content */}
        <div className="flex flex-col h-full p-4 md:p-8 gap-5 md:gap-6">
          {/* Header row: Camera icon centered, Close button absolute */}
          <div className="relative flex justify-center pt-2">
            {/* Camera icon - centered */}
            <div className="w-[88px] h-[88px]">
              <CaptureIcon className="w-full h-full" iconType="camera" />
            </div>

            {/* Close button - absolute positioned */}
            <button
              onClick={onClose}
              className="absolute right-0 top-2 w-12 h-12 hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              <CloseIcon className="w-full h-full" />
            </button>
          </div>

          {/* Title section */}
          <div className="flex flex-col items-center gap-3">
            {/* Title */}
            <h2 className="font-crimson-pro font-bold text-[28px] md:text-[32px] leading-[22px] text-white text-center">
              Choose your pack
            </h2>

            {/* Subtitle and stats */}
            <div className="flex flex-col gap-3 items-center">
              <p className="font-ibm-plex-mono font-medium text-base text-white text-center">
                Your best picture might be next.
              </p>
              <p className="font-ibm-plex-mono font-medium text-[13px] text-white">
                Already 1 567 photos generated ⚡️
              </p>
            </div>
          </div>

          {/* Cards section - responsive layout */}
          <div className="relative -mx-4 md:mx-0 overflow-visible">
            {/* Mobile: Horizontal scroll | Desktop: Grid */}
            <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible overflow-y-visible pb-4 pt-6 px-12 md:px-0 md:pt-8 snap-x snap-mandatory md:snap-none scrollbar-hide scroll-smooth">
              {packages.map((pkg, index) => {
                const isSelected = selectedPackage?.id === pkg.id
                const isCreator = pkg.name === 'Creator'

                return (
                  <div key={pkg.id || index} data-pack={pkg.name} className="relative flex-shrink-0 md:flex-shrink snap-center md:snap-align-none">
                    {/* "Most popular plan" badge - straddles card border */}
                    {isCreator && (
                      <div className="absolute -top-4 right-4 z-10 bg-[#fab617] text-white font-ibm-plex-mono font-medium text-sm px-2 py-1.5 rounded-[10px] whitespace-nowrap shadow-lg">
                        Most popular plan
                      </div>
                    )}

                    {/* Pack card */}
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className={`
                        min-w-[240px] md:min-w-0 md:w-full md:h-full p-6 rounded-2xl flex flex-col gap-4
                        focus:outline-none
                        transition-all duration-200
                        md:hover:scale-105 md:hover:shadow-xl
                        ${isSelected
                          ? 'border-2 !border-[#fab617] bg-[#424141]'
                          : 'border-2 border-transparent bg-[#424141]'
                        }
                        shadow-[3px_4px_4px_0px_rgba(0,0,0,0.4)]
                      `}
                    >
                      {/* Card header */}
                      <div className="flex gap-4 items-start">
                        {/* Selection checkbox */}
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                          transition-colors duration-200
                          ${isSelected ? 'bg-[#fab617]' : 'bg-transparent border-2 border-gray-500'}
                        `}>
                          {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                        </div>

                        {/* Pack details */}
                        <div className="flex gap-8 items-start flex-1">
                          {/* Left: Name and features */}
                          <div className="flex flex-col gap-2.5">
                            <h3 className="font-crimson-pro font-bold text-xl leading-tight text-white text-left">
                              {pkg.name} - {pkg.credits === 10 ? '1O' : pkg.credits === 30 ? '3O' : '1O0'} images
                            </h3>

                            {/* Features */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1.5 items-center">
                                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                                <span className="font-ibm-plex-mono font-medium text-[11px] text-white">
                                  All filters
                                </span>
                              </div>
                              <div className="flex gap-1.5 items-center">
                                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                                <span className="font-ibm-plex-mono font-medium text-[11px] text-white">
                                  HD Quality
                                </span>
                              </div>
                              <div className="flex gap-1.5 items-center">
                                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                                <span className="font-ibm-plex-mono font-medium text-[11px] text-white">
                                  Instant download
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Price */}
                          <div className="flex flex-col justify-start">
                            <p className="font-ibm-plex-mono font-medium text-base text-white whitespace-nowrap">
                              {formatPrice(pkg.price_cents, pkg.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info items */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-8 items-center justify-center">
            <p className="font-ibm-plex-mono font-medium text-[13px] text-white text-center">
              ✨ No subscription required
            </p>
            <p className="font-ibm-plex-mono font-medium text-[13px] text-white text-center">
              🔓 Secure payment with Stripe
            </p>
            <p className="font-ibm-plex-mono font-medium text-[13px] text-white text-center">
              ⚡️ Instant delivery
            </p>
          </div>

          {/* CTA Button - centered */}
          <div className="pb-4 flex justify-center">
            <div className="w-[334px] h-[56px]">
              <SkeuomorphicRectButton
                width={334}
                height={56}
                gradientId="paywall-cta"
                onClick={handleCheckout}
                disabled={processingCheckout || !selectedPackage}
              >
                <span className="font-ibm-plex-mono font-medium text-base text-[#fab617]">
                  Get {selectedPackage?.name || 'Creator'} pack - {selectedPackage ? formatPrice(selectedPackage.price_cents, selectedPackage.currency) : '6.99€'}
                </span>
              </SkeuomorphicRectButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
