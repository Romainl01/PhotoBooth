/**
 * ArrowLeftIcon Component
 *
 * Left arrow button icon using SkeuomorphicCircleButton base component
 */

'use client';

import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function ArrowLeftIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={48}
      gradientId="arrow-left-gradient"
      className={className}
    >
      {/* Left arrow */}
      <path
        d="M27 18L21 24L27 30"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SkeuomorphicCircleButton>
  );
}
