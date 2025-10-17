/**
 * RetryIcon Component
 *
 * Retry/New Photo button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Circular arrow refresh icon
 */

'use client';

export default function RetryIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient
          id="retry-gradient"
          x1="32"
          y1="2.90909"
          x2="32"
          y2="61.0909"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Outer black circle */}
      <circle cx="32" cy="32" r="32" fill="#000000" />

      {/* Inner circle with gradient border */}
      <circle
        cx="32"
        cy="32"
        r="29.0909"
        fill="#232323"
        stroke="url(#retry-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Retry icon */}
      <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 32C23 33.78 23.5278 35.5201 24.5168 37.0001C25.5057 38.4802 26.9113 39.6337 28.5558 40.3149C30.2004 40.9961 32.01 41.1743 33.7558 40.8271C35.5016 40.4798 37.1053 39.6226 38.364 38.364C39.6226 37.1053 40.4798 35.5016 40.8271 33.7558C41.1743 32.01 40.9961 30.2004 40.3149 28.5558C39.6337 26.9113 38.4802 25.5057 37.0001 24.5168C35.5201 23.5278 33.78 23 32 23C29.484 23.0095 27.069 23.9912 25.26 25.74L23 28" />
        <path d="M23 23V28H28" />
      </g>
    </svg>
  );
}
