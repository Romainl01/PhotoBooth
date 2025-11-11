/**
 * FilmStrip Component
 *
 * Authentic analog film strip carousel with Fujifilm-inspired aesthetics
 * Features:
 * - Infinite seamless loop (no rewinding)
 * - Authentic rounded rectangular perforations (SVG pattern)
 * - Modern neutral Fujifilm color palette (cool gray-blue)
 * - Multi-layer shadows for 3D depth
 * - Moving perforations (scroll with photos)
 * - Randomized image order (shuffled on mount)
 * - Film grain overlay
 * - Subtle vignette effect
 * - GPU-accelerated smooth transitions
 *
 * Props:
 * - images: Array<{src: string, alt: string}> (required) - Photos to display
 * - intervalMs: number - Auto-advance interval (default: 3000)
 * - transitionMs: number - Slide transition duration (default: 500)
 * - children: ReactNode - Content to overlay (e.g., GoogleButton)
 */

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';

export default function FilmStrip({
  images = [],
  intervalMs = 3000,
  transitionMs = 500,
  children,
}) {
  // Shuffle images once on mount for random display order
  const shuffledImages = useMemo(() => {
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const filmTrackRef = useRef(null);

  // Create extended array for infinite loop: [images..., first image clone]
  const extendedImages = useMemo(() => {
    if (shuffledImages.length === 0) return [];
    return [...shuffledImages, shuffledImages[0]];
  }, [shuffledImages]);

  // Auto-advance carousel with infinite loop
  useEffect(() => {
    if (shuffledImages.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [shuffledImages.length, intervalMs]);

  // Reset to start when reaching the cloned first image
  useEffect(() => {
    if (currentIndex === shuffledImages.length) {
      // Wait for transition to complete, then instantly reset
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, transitionMs);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, shuffledImages.length, transitionMs]);

  // Re-enable transitions after instant reset
  useEffect(() => {
    if (!isTransitioning && currentIndex === 0) {
      // Force reflow to ensure transition is disabled, then re-enable
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, currentIndex]);

  if (!shuffledImages.length) {
    return null; // Graceful fallback if no images provided
  }

  // Generate unique IDs for SVG patterns (to avoid conflicts if multiple instances)
  const perforationPatternId = `perforation-pattern-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className="
        bg-[#272727]
        rounded-[44px]
        border-[1px] border-black
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        w-[338px] md:w-[800px]
      "
    >
      {/* SVG Pattern Definition - Kodak-style rounded rectangular perforations */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* Perforation Pattern */}
          <pattern
            id={perforationPatternId}
            x="0"
            y="0"
            width="40"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            {/* Perforation hole - rounded rectangle */}
            <rect
              x="12"
              y="8"
              width="16"
              height="12"
              rx="2"
              ry="2"
              fill="#1c1e21"
            />
            {/* Inner shadow (top edge - creates depth) */}
            <rect
              x="12"
              y="8"
              width="16"
              height="2"
              rx="2"
              ry="2"
              fill="rgba(0, 0, 0, 0.5)"
              opacity="0.6"
            />
            {/* Bottom highlight (light catching edge) */}
            <rect
              x="12"
              y="18"
              width="16"
              height="1"
              fill="rgba(255, 255, 255, 0.08)"
            />
          </pattern>
        </defs>
      </svg>

      {/* Camera POV Frame */}
      <div className="p-[12px]">
        {/* Film Strip Container - Viewport */}
        <div
          className="
            relative
            rounded-[32px]
            border-[1px] border-black/40
            shadow-[0px_4px_4px_0px_rgba(255,255,255,0.15),0px_4px_4px_0px_rgba(0,0,0,0.25)]
            overflow-hidden
            h-[338px] md:h-[456px]
            w-full
            bg-[#0a0a0a]
          "
        >
          {/* Moving Film Track - Contains perforations + photos */}
          <div
            ref={filmTrackRef}
            className="absolute inset-0 flex"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: isTransitioning
                ? `transform ${transitionMs}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {/* Top Perforation Strip - Fujifilm Modern Neutral */}
            <div
              className="
                absolute top-0 left-0 h-[26px] md:h-[30px] z-30
                pointer-events-none
              "
              style={{
                width: `${extendedImages.length * 100}%`,
                background: `
                  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="28"><rect x="12" y="8" width="16" height="12" rx="2" fill="%231c1e21"/><rect x="12" y="8" width="16" height="2" rx="1" fill="rgba(0,0,0,0.5)" opacity="0.6"/><rect x="12" y="18" width="16" height="1" fill="rgba(255,255,255,0.08)"/></svg>') repeat-x,
                  linear-gradient(to bottom, #424548 0%, #3a3d40 50%, #32353a 100%)
                `,
                boxShadow: `
                  0 2px 4px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
                borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Subtle texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Bottom Perforation Strip - Fujifilm Modern Neutral */}
            <div
              className="
                absolute bottom-0 left-0 h-[26px] md:h-[30px] z-30
                pointer-events-none
              "
              style={{
                width: `${extendedImages.length * 100}%`,
                background: `
                  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="28"><rect x="12" y="8" width="16" height="12" rx="2" fill="%231c1e21"/><rect x="12" y="8" width="16" height="2" rx="1" fill="rgba(0,0,0,0.5)" opacity="0.6"/><rect x="12" y="18" width="16" height="1" fill="rgba(255,255,255,0.08)"/></svg>') repeat-x,
                  linear-gradient(to bottom, #32353a 0%, #3a3d40 50%, #424548 100%)
                `,
                boxShadow: `
                  0 -2px 4px rgba(0, 0, 0, 0.4),
                  inset 0 -1px 0 rgba(255, 255, 255, 0.05)
                `,
                borderTop: '1px solid rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Subtle texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Photo Frames */}
            {extendedImages.map((image, idx) => (
              <div
                key={`${image.src}-${idx}`}
                className="
                  flex-shrink-0
                  w-full h-full
                  relative
                "
              >
                {/* Photo */}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 338px, 800px"
                  quality={85}
                />
              </div>
            ))}
          </div>

          {/* Film Grain Overlay - Static */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: 0.15,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Vignette Overlay - Static */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.3) 100%)`,
            }}
          />

          {/* Layered Shadow Effects for Depth (preserved from ShowcaseTV) */}
          <div className="
            absolute inset-0 pointer-events-none z-20
            shadow-[0px_2px_40px_0px_inset_rgba(0,0,0,0.5),0px_2px_12px_0px_inset_rgba(0,0,0,0.8)]
          " />

          {/* Glass Reflection Effect (preserved from ShowcaseTV) */}
          <div className="
            absolute inset-0 pointer-events-none z-20
            shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.08)]
          " />
        </div>
      </div>

      {/* Button Bar (bottom section on gray background) */}
      {children && (
        <div className="flex items-center justify-center w-full pb-[16px] px-[32px]">
          {children}
        </div>
      )}
    </div>
  );
}
