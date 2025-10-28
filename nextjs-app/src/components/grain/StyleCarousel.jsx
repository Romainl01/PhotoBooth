'use client'

import { useSwipeable } from 'react-swipeable'

/**
 * StyleCarousel - Swipeable carousel for style selection
 *
 * Features:
 * - Arrow navigation (left/right)
 * - Swipe gestures on touch devices
 * - Keyboard navigation (arrow keys)
 * - Yellow accent for current style
 */

const STYLES = [
  { id: 'Corporate Classic', label: 'Corporate' },
  { id: 'Creative Professional', label: 'Creative' },
  { id: 'Executive Portrait', label: 'Executive' }
]

export default function StyleCarousel({ selectedStyle, onStyleChange }) {
  const currentIndex = STYLES.findIndex(s => s.id === selectedStyle)

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : STYLES.length - 1
    onStyleChange(STYLES[newIndex].id)
  }

  const goToNext = () => {
    const newIndex = currentIndex < STYLES.length - 1 ? currentIndex + 1 : 0
    onStyleChange(STYLES[newIndex].id)
  }

  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: true, // Also works with mouse drag
    preventScrollOnSwipe: true,
  })

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  return (
    <div
      className="style-carousel"
      {...handlers}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Style selector"
    >
      <button
        onClick={goToPrevious}
        className="arrow-button arrow-left"
        aria-label="Previous style"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="style-display">
        <span className="style-label">{STYLES[currentIndex].label}</span>
        <div className="style-dots">
          {STYLES.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={goToNext}
        className="arrow-button arrow-right"
        aria-label="Next style"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <style jsx>{`
        .style-carousel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          user-select: none;
          outline: none;
        }

        .arrow-button {
          background: transparent;
          border: none;
          color: var(--color-white);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          opacity: 0.7;
        }

        .arrow-button:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .arrow-button:active {
          transform: scale(0.95);
        }

        .style-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 140px;
        }

        .style-label {
          font-family: var(--font-family);
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-primary);
          text-align: center;
        }

        .style-dots {
          display: flex;
          gap: 0.375rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-medium-gray);
          transition: all 0.2s;
        }

        .dot.active {
          background-color: var(--color-primary);
          width: 8px;
          height: 8px;
        }

        /* Swipe hint (subtle) */
        @media (max-width: 767px) {
          .style-carousel {
            touch-action: pan-y;
          }
        }
      `}</style>
    </div>
  )
}
