/**
 * InfoIcon Component
 *
 * Information icon using SkeuomorphicCircleButton base component
 */

'use client';

import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function InfoIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={64}
      gradientId="info-gradient"
      className={className}
    >
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
    </SkeuomorphicCircleButton>
  );
}
