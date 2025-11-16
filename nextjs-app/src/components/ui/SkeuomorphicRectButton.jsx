/**
 * SkeuomorphicRectButton Component
 *
 * Reusable base component for rectangular skeuomorphic buttons.
 * Provides the consistent two-layer border effect used across the app:
 * - Outer black border
 * - Inner layer with vertical gradient stroke
 *
 * Props:
 * - width: number - Button width in px (default: 334)
 * - height: number - Button height in px (default: 56)
 * - gradientId: string (required) - Unique ID for the gradient
 * - onClick: function - Click handler
 * - className: string - Additional CSS classes
 * - disabled: boolean - Disable button interaction
 * - children: ReactNode - Button content (wrapped in foreignObject)
 */

'use client';

export default function SkeuomorphicRectButton({
  width = 334,
  height = 56,
  gradientId,
  onClick,
  className = '',
  disabled = false,
  children,
  ...props
}) {
  // Calculate dimensions based on formulas
  const padding = 4;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const outerRx = height * 0.339;
  const innerRx = height * 0.268;

  // Gradient coordinates
  const gradientX = width / 2;
  const gradientY1 = height * 0.054;
  const gradientY2 = height * 0.946;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`
        cursor-pointer
        transition-transform
        active:scale-button-press
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      style={{ display: 'block' }}
      {...props}
    >
      <defs>
        {/* Linear gradient for border - vertical gradient */}
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
      </defs>

      {/* Outer black border */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={outerRx}
        fill="#000000"
      />

      {/* Inner button background */}
      <rect
        x={padding}
        y={padding}
        width={innerWidth}
        height={innerHeight}
        rx={innerRx}
        fill="#232323"
      />

      {/* Inner button with gradient stroke */}
      <rect
        x={padding}
        y={padding}
        width={innerWidth}
        height={innerHeight}
        rx={innerRx}
        stroke={`url(#${gradientId})`}
        strokeOpacity="0.6"
        strokeWidth="2"
        fill="none"
      />

      {/* Button content */}
      <foreignObject x="0" y="0" width={width} height={height}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
