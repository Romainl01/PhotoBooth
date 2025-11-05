/**
 * Loader Component
 *
 * Responsive loading overlay with:
 * - Optional captured photo preview in background
 * - Semi-transparent dark background overlay
 * - Skeumorphic loading icon with yellow animated spinner
 * - Dynamic contextual loading messages with typewriter effect (like Claude Code)
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
import useTypewriter from '@/hooks/useTypewriter';

// Timing constants (single source of truth)
const TYPING_SPEED_MS = 70;      // Deliberate typing speed for better readability (70ms per character)
const CYCLE_INTERVAL_MS = 4500;  // 4.5 seconds per message (instant change + typing + reading)

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

  // Simplified message rotation logic (instant message changes, no fade animations)
  useEffect(() => {
    if (prefersReducedMotion) {
      // Respect user preference - no animation, show first message only
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const nextIndex = prev + 1;

        // If we've reached the end of shuffled messages, reshuffle and start over
        if (nextIndex >= shuffledMessages.length) {
          setShuffledMessages(shuffleArray(messages));
          return 0; // Start from beginning of new shuffled array
        }

        return nextIndex;
      });
      // Message changes instantly! Typewriter hook auto-restarts via useEffect dependency.
    }, CYCLE_INTERVAL_MS); // 4500ms = typing time + reading time

    return () => clearInterval(intervalId);
  }, [shuffledMessages.length, messages, prefersReducedMotion]);

  // Reset when filter changes - reshuffle for new filter
  useEffect(() => {
    setCurrentMessageIndex(0);
    setShuffledMessages(shuffleArray(messages));
  }, [filterName, messages]);

  const currentMessage = shuffledMessages[currentMessageIndex];

  // Use typewriter effect hook (handles character-by-character reveal)
  const displayedText = useTypewriter(
    currentMessage,
    TYPING_SPEED_MS,
    prefersReducedMotion,
    true  // Show cursor while typing
  );

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

              {/* Dynamic loading message with typewriter effect and accessibility */}
              <div role="status" aria-live="polite" aria-atomic="true">
                <p
                  className="font-mono font-medium text-body text-text-primary text-center px-4 max-w-md mx-auto"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)', // Improves readability on light photos
                  }}
                >
                  {displayedText}
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
