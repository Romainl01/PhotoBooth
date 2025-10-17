/**
 * UploadIcon Component
 *
 * Upload/Gallery button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Pictures/gallery icon
 */

'use client';

export default function UploadIcon({ className = '' }) {
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
          id="upload-gradient"
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
        stroke="url(#upload-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Pictures icon */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 31L40.704 29.704C40.4809 29.4791 40.2154 29.3005 39.923 29.1787C39.6305 29.0568 39.3168 28.9941 39 28.9941C38.6832 28.9941 38.3695 29.0568 38.077 29.1787C37.7846 29.3005 37.5191 29.4791 37.296 29.704L31 36" />
        <path d="M24 28C23.4696 28 22.9609 28.2107 22.5858 28.5858C22.2107 28.9609 22 29.4696 22 30V40C22 40.5304 22.2107 41.0391 22.5858 41.4142C22.9609 41.7893 23.4696 42 24 42H34C34.5304 42 35.0391 41.7893 35.4142 41.4142C35.7893 41.0391 36 40.5304 36 40" />
        <path d="M33 28C33.5523 28 34 27.5523 34 27C34 26.4477 33.5523 26 33 26C32.4477 26 32 26.4477 32 27C32 27.5523 32.4477 28 33 28Z" fill="#ffffff" />
        <path d="M40 22H30C28.8954 22 28 22.8954 28 24V34C28 35.1046 28.8954 36 30 36H40C41.1046 36 42 35.1046 42 34V24C42 22.8954 41.1046 22 40 22Z" />
      </g>
    </svg>
  );
}
