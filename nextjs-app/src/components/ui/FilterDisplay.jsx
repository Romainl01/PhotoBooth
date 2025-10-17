/**
 * FilterDisplay Component
 *
 * Custom SVG-based filter display matching Figma design with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke (135deg) as actual stroke, not fill
 * - Text rendered as foreignObject for dynamic content
 */

'use client';

export default function FilterDisplay({ filterName, className = '' }) {
  return (
    <svg
      viewBox="0 0 140 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Linear gradient - vertical (top to bottom) for stroke */}
        <linearGradient
          id="filter-border-gradient"
          x1="70"
          y1="0"
          x2="70"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#666666" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Outer black border */}
      <rect
        x="0"
        y="0"
        width="140"
        height="52"
        rx="19"
        fill="#000000"
      />

      {/* Inner rounded rect with gradient stroke */}
      <rect
        x="3.5"
        y="3.5"
        width="133"
        height="45"
        rx="15.5"
        fill="#232323"
        stroke="url(#filter-border-gradient)"
        strokeWidth="2"
      />

      {/* Text content using foreignObject for HTML rendering */}
      <foreignObject x="12" y="15" width="116" height="22">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontWeight: '500',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFB800',
            whiteSpace: 'nowrap',
          }}
        >
          {filterName}
        </div>
      </foreignObject>
    </svg>
  );
}
