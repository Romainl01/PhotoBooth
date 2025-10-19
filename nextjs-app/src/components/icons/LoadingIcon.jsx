/**
 * LoadingIcon Component
 *
 * Animated loading spinner icon with:
 * - Skeumorphic double-border design (same as CaptureIcon)
 * - Yellow (#FAB617) rotating spinner with 8 segments
 * - Varying opacity for animation effect
 * - Clockwise rotation
 */

'use client';

export default function LoadingIcon({ className = '' }) {
  return (
    <>
      <style jsx>{`
        @keyframes pulse-segment {
          0%, 100% {
            opacity: 0.125;
          }
          12.5% {
            opacity: 1;
          }
        }

        .segment-1 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0s; }
        .segment-2 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.14s; }
        .segment-3 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.28s; }
        .segment-4 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.42s; }
        .segment-5 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.56s; }
        .segment-6 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.7s; }
        .segment-7 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.84s; }
        .segment-8 { animation: pulse-segment 1.12s linear infinite; animation-delay: 0.98s; }
      `}</style>
      <svg
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'block' }}
      >
      <defs>
        {/* Linear gradient for border */}
        <linearGradient
          id="loading-icon-gradient"
          x1="44"
          y1="4"
          x2="44"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Outer black circle */}
      <circle cx="44" cy="44" r="44" fill="#000000" />

      {/* Inner circle with gradient border */}
      <circle cx="44" cy="44" r="40" fill="#232323" />
      <circle
        cx="44"
        cy="44"
        r="40"
        stroke="url(#loading-icon-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
        fill="none"
      />

      {/* Animated spinner - 8 segments with pulsing opacity, centered in 88x88 (translate to center the 48x48 spinner) */}
      <g transform="translate(20, 20)">
        {/* Top segment (12 o'clock) - segment 1 */}
        <path className="segment-1" d="M24 4V12" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Top-right segment (1:30) - segment 2 */}
        <path className="segment-2" d="M32.4 15.6L38.2 9.8" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Right segment (3 o'clock) - segment 3 */}
        <path className="segment-3" d="M36 24H44" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Bottom-right segment (4:30) - segment 4 */}
        <path className="segment-4" d="M32.4 32.4L38.2 38.2" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Bottom segment (6 o'clock) - segment 5 */}
        <path className="segment-5" d="M24 36V44" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Bottom-left segment (7:30) - segment 6 */}
        <path className="segment-6" d="M9.79999 38.2L15.6 32.4" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Left segment (9 o'clock) - segment 7 */}
        <path className="segment-7" d="M4 24H12" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Top-left segment (10:30) - segment 8 */}
        <path className="segment-8" d="M9.79999 9.8L15.6 15.6" stroke="#FAB617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      </svg>
    </>
  );
}
