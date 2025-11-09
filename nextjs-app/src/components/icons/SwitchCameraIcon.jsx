/**
 * SwitchCameraIcon Component
 *
 * Camera switch button icon using SkeuomorphicCircleButton base component
 */

'use client';

import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function SwitchCameraIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={64}
      gradientId="switch-gradient"
      className={className}
    >
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
    </SkeuomorphicCircleButton>
  );
}
