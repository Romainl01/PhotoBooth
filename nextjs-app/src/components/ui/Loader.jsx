/**
 * Loader Component
 *
 * Responsive loading overlay with:
 * - Optional captured photo preview in background
 * - Semi-transparent dark background overlay
 * - Skeumorphic loading icon with yellow animated spinner
 * - Dynamic contextual loading messages that rotate based on filter
 *
 * Mobile: Covers camera preview area only, leaves buttons visible
 * Desktop: Full-screen coverage
 *
 * Accessibility:
 * - Respects prefers-reduced-motion preference
 * - ARIA live region for screen reader announcements
 * - Text shadow for readability over light photos
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { LOADING_MESSAGES, GENERIC_MESSAGES } from '@/constants/loadingMessages';
import LoadingIcon from '../icons/LoadingIcon';

// Timing constants (single source of truth)
const FADE_DURATION_MS = 300;
const MESSAGE_DISPLAY_MS = 3000;
const CYCLE_INTERVAL_MS = MESSAGE_DISPLAY_MS + (FADE_DURATION_MS * 2); // 3600ms total

/**
 * Shuffles an array using Fisher-Yates algorithm
 * This ensures all messages are seen before repeating, but in random order
 */
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledArray[i];
    shuffledArray[i] = shuffledArray[j];
    shuffledArray[j] = temp;
  }

  return shuffledArray;
}

export default function Loader({ filterName, imageUrl = null }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Memoize message lookup to avoid recalculation on every render
  const messages = useMemo(() => {
    return LOADING_MESSAGES[filterName] || GENERIC_MESSAGES || ['Loading...'];
  }, [filterName]);

  // Shuffled messages - reshuffles when we reach the end or filter changes
  const [shuffledMessages, setShuffledMessages] = useState(() => shuffleArray(messages));

  // Detect reduced motion preference (accessibility)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Message rotation logic with shuffling
  useEffect(() => {
    if (prefersReducedMotion) {
      // Respect user preference - no animation, show first message only
      return;
    }

    setIsVisible(true);

    const intervalId = setInterval(() => {
      // Fade out current message
      setIsVisible(false);

      // After fade-out completes, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex(prev => {
          const nextIndex = prev + 1;

          // If we've reached the end of shuffled messages, reshuffle and start over
          if (nextIndex >= shuffledMessages.length) {
            setShuffledMessages(shuffleArray(messages));
            return 0; // Start from beginning of new shuffled array
          }

          return nextIndex;
        });
        setIsVisible(true);
      }, FADE_DURATION_MS);

    }, CYCLE_INTERVAL_MS); // 3600ms = 3000ms display + 600ms transitions

    return () => clearInterval(intervalId);
  }, [shuffledMessages.length, messages, prefersReducedMotion]);

  // Reset when filter changes - reshuffle for new filter
  useEffect(() => {
    setCurrentMessageIndex(0);
    setShuffledMessages(shuffleArray(messages));
    setIsVisible(true);
  }, [filterName, messages]);

  const currentMessage = shuffledMessages[currentMessageIndex];

  return (
    <>
      {/* Unified loader for mobile and desktop */}
      <div className="absolute top-[8px] md:top-0 left-[12px] md:left-0 right-[12px] md:right-0 bottom-[calc(16px+88px+16px+52px+40px+8px)] md:bottom-0 z-50 animate-fadeIn pointer-events-none">
        <div className="bg-camera-bg h-full relative rounded-[32px] md:rounded-none shadow-camera-view md:shadow-none overflow-hidden">
          {/* Captured photo preview (if available) */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Captured photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Loading content centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col gap-4 items-center">
              {/* Skeumorphic loading icon */}
              <LoadingIcon className="w-[88px] h-[88px]" />

              {/* Dynamic loading message with accessibility */}
              <div role="status" aria-live="polite" aria-atomic="true">
                <p
                  className={`font-mono font-medium text-body text-text-primary text-center px-4 max-w-md mx-auto transition-opacity ease-in-out ${
                    prefersReducedMotion ? '' : (isVisible ? 'opacity-100' : 'opacity-0')
                  }`}
                  style={{
                    transitionDuration: `${FADE_DURATION_MS}ms`,
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)', // Improves readability on light photos
                  }}
                >
                  {currentMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none shadow-camera-inner md:shadow-none" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 150ms ease-out 200ms both;
        }
      `}</style>
    </>
  );
}
