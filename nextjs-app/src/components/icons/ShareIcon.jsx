/**
 * ShareIcon Component
 *
 * Share button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Upload/share arrow icon
 */

'use client';

export default function ShareIcon({ className = '' }) {
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
          id="share-gradient"
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
        stroke="url(#share-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Share icon */}
      <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 22V35" />
        <path d="M36 26L32 22L28 26" />
        <path d="M24 32V40C24 40.5304 24.2107 41.0391 24.5858 41.4142C24.9609 41.7893 25.4696 42 26 42H38C38.5304 42 39.0391 41.7893 39.4142 41.4142C39.7893 41.0391 40 40.5304 40 40V32" />
      </g>
    </svg>
  );
}
