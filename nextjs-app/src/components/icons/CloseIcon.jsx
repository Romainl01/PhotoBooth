/**
 * CloseIcon Component
 *
 * Close/X button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - X/cross icon
 */

'use client';

export default function CloseIcon({ className = '' }) {
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
          id="close-gradient-1"
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
          id="close-gradient-2"
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
        stroke="url(#close-gradient-1)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />
      <circle
        cx="24.0001"
        cy="24.0001"
        r="21.8182"
        fill="#232323"
        stroke="url(#close-gradient-2)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* X/Cross icon - scaled to 48x48 viewbox */}
      <path
        d="M30 18L18 30"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 18L30 30"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
