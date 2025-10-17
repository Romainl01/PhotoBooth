/**
 * SwitchCameraIcon Component
 *
 * Camera switch button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Circular arrows icon for camera flip
 */

'use client';

export default function SwitchCameraIcon({ className = '' }) {
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
          id="switch-gradient-1"
          x1="32"
          y1="2.90909"
          x2="32"
          y2="61.0909"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient
          id="switch-gradient-2"
          x1="32.0001"
          y1="2.90918"
          x2="32.0001"
          y2="61.091"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Outer black circle */}
      <circle cx="32" cy="32" r="32" fill="#000000" />

      {/* Inner circles with gradient borders */}
      <circle
        cx="32"
        cy="32"
        r="29.0909"
        fill="#232323"
        stroke="url(#switch-gradient-1)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />
      <circle
        cx="32.0001"
        cy="32.0001"
        r="29.0909"
        fill="#232323"
        stroke="url(#switch-gradient-2)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Return/Switch icon */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M41 32C41 29.6131 40.0518 27.3239 38.364 25.636C36.6761 23.9482 34.3869 23 32 23C29.484 23.0095 27.069 23.9912 25.26 25.74L23.5 27.5"
          strokeWidth="3"
        />
        <path d="M23 23V28H28" strokeWidth="2" />
        <path
          d="M23 32C23 34.3869 23.9482 36.6761 25.636 38.364C27.3239 40.0518 29.6131 41 32 41C34.516 40.9905 36.931 40.0088 38.74 38.26L40.5 36.5"
          strokeWidth="3"
        />
        <path d="M36 36H41V41" strokeWidth="2" />
      </g>
    </svg>
  );
}
