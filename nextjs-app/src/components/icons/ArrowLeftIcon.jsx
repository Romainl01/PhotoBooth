/**
 * ArrowLeftIcon Component
 *
 * Left arrow button icon for filter navigation with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Left chevron arrow
 */

'use client';

export default function ArrowLeftIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient
          id="arrow-left-gradient-1"
          x1="24.0001"
          y1="2.18188"
          x2="24.0001"
          y2="45.8182"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient
          id="arrow-left-gradient-2"
          x1="24.0001"
          y1="2.18188"
          x2="24.0001"
          y2="45.8182"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Outer black circle */}
      <circle cx="24" cy="24" r="24" fill="#000000" />

      {/* Inner circles with gradient borders */}
      <circle
        cx="24.0001"
        cy="24.0001"
        r="21.8182"
        fill="#232323"
        stroke="url(#arrow-left-gradient-1)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />
      <circle
        cx="24.0001"
        cy="24.0001"
        r="21.8182"
        fill="#232323"
        stroke="url(#arrow-left-gradient-2)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Left arrow */}
      <path
        d="M27 18L21 24L27 30"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
