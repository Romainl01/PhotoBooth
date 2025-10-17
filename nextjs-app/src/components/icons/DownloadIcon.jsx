/**
 * DownloadIcon Component
 *
 * Download button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Download arrow icon
 */

'use client';

export default function DownloadIcon({ className = '' }) {
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
          id="download-gradient"
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
        stroke="url(#download-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
      />

      {/* Download icon */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 35V23" strokeWidth="3" />
        <path
          d="M41 35V39C41 39.5304 40.7893 40.0391 40.4142 40.4142C40.0391 40.7893 39.5304 41 39 41H25C24.4696 41 23.9609 40.7893 23.5858 40.4142C23.2107 40.0391 23 39.5304 23 39V35"
          strokeWidth="3"
        />
        <path d="M27 30L32 35L37 30" strokeWidth="3" />
      </g>
    </svg>
  );
}
