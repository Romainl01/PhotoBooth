/**
 * ArrowRightIcon Component
 *
 * Right arrow button icon using SkeuomorphicCircleButton base component
 */

'use client';

import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function ArrowRightIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={48}
      gradientId="arrow-right-gradient"
      className={className}
    >
      {/* Right arrow */}
      <path
        d="M21 30L27 24L21 18"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SkeuomorphicCircleButton>
  );
}
