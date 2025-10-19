/**
 * RetryButton Component
 *
 * SVG-based skeumorphic retry button matching Figma design:
 * - Outer black border (3px padding, 19px radius)
 * - Inner button (#232323 bg, 2px #666666 border, 16px radius)
 * - Full width button for error screens
 */

'use client';

export default function RetryButton({ onClick, children = 'Retry', className = '' }) {
  return (
    <svg
      viewBox="0 0 334 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer transition-transform active:scale-[0.97] ${className}`}
      onClick={onClick}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Linear gradient for border - vertical gradient */}
        <linearGradient
          id="retry-button-gradient"
          x1="167"
          y1="3"
          x2="167"
          y2="53"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Outer black border */}
      <rect
        x="0"
        y="0"
        width="334"
        height="56"
        rx="19"
        fill="#000000"
      />

      {/* Inner button background */}
      <rect
        x="4"
        y="4"
        width="326"
        height="48"
        rx="15"
        fill="#232323"
      />

      {/* Inner button with gradient stroke */}
      <rect
        x="4"
        y="4"
        width="326"
        height="48"
        rx="15"
        stroke="url(#retry-button-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
        fill="none"
      />

      {/* Button text */}
      <foreignObject x="0" y="0" width="334" height="56">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontWeight: '500',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
