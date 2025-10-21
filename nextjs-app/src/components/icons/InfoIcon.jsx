/**
 * InfoIcon Component
 *
 * Information icon with skeumorphic double-border design matching UploadIcon
 */

'use client';

export default function InfoIcon({ className = '' }) {
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
          id="info-gradient"
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
        stroke="url(#info-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Info icon - centered in 64x64 viewbox */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <circle
          cx="32"
          cy="32"
          r="10"
          strokeWidth="2"
        />
        <path
          d="M32 36V32"
          strokeWidth="3"
        />
        <path
          d="M32 28H32.01"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
