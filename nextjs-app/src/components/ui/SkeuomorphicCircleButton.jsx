/**
 * SkeuomorphicCircleButton Component
 *
 * Reusable base component for circular skeuomorphic buttons.
 * Provides the consistent two-layer circle effect with optional red recording light:
 * - Outer black circle
 * - Inner circle with vertical gradient stroke
 * - Optional red recording indicator with glow
 *
 * Props:
 * - diameter: number (required) - Circle diameter in px
 * - gradientId: string (required) - Unique ID for the gradient
 * - showRedLight: boolean (default: false) - Show red recording indicator
 * - redLightFilterId: string - Unique ID for red light glow filter (required if showRedLight=true)
 * - onClick: function - Click handler
 * - className: string - Additional CSS classes
 * - children: ReactNode - Button content (SVG elements or foreignObject)
 */

'use client';

export default function SkeuomorphicCircleButton({
  diameter,
  gradientId,
  showRedLight = false,
  redLightFilterId,
  onClick,
  className = '',
  children,
}) {
  // Calculate dimensions based on formulas
  const center = diameter / 2;
  const outerRadius = diameter / 2;
  const innerRadius = diameter * 0.454;

  // Gradient coordinates
  const gradientX = center;
  const gradientY1 = diameter * 0.0455;
  const gradientY2 = diameter * 0.955;

  // Red light dimensions
  const redLightCy = diameter * 0.727;
  const redLightOuterR = diameter * 0.068;
  const redLightInnerR = diameter * 0.034;

  // Filter dimensions
  const filterSize = diameter * 0.25;
  const filterX = center - filterSize / 2;
  const filterY = redLightCy - filterSize / 2;
  const filterBlur = diameter * 0.028;

  return (
    <svg
      viewBox={`0 0 ${diameter} ${diameter}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Linear gradient for border */}
        <linearGradient
          id={gradientId}
          x1={gradientX}
          y1={gradientY1}
          x2={gradientX}
          y2={gradientY2}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>

        {/* Glow filter for red light */}
        {showRedLight && (
          <filter
            id={redLightFilterId}
            x={filterX}
            y={filterY}
            width={filterSize}
            height={filterSize}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation={filterBlur} result="effect1_foregroundBlur" />
          </filter>
        )}
      </defs>

      {/* Outer black circle */}
      <circle cx={center} cy={center} r={outerRadius} fill="#000000" />

      {/* Inner circle with gradient border */}
      <circle cx={center} cy={center} r={innerRadius} fill="#232323" />
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        stroke={`url(#${gradientId})`}
        strokeOpacity="0.6"
        strokeWidth="2"
        fill="none"
      />

      {/* Button content */}
      {children}

      {/* Red recording light with glow */}
      {showRedLight && (
        <>
          <g opacity="0.5" filter={`url(#${redLightFilterId})`}>
            <circle cx={center} cy={redLightCy} r={redLightOuterR} fill="#CD0E0E" />
          </g>
          <circle cx={center} cy={redLightCy} r={redLightInnerR} fill="#FF0000" />
        </>
      )}
    </svg>
  );
}
