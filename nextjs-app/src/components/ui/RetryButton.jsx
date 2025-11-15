/**
 * RetryButton Component
 *
 * SVG-based skeumorphic retry button matching Figma design:
 * - Uses SkeuomorphicRectButton base component
 * - Full width button for error screens
 */

'use client';

import SkeuomorphicRectButton from './SkeuomorphicRectButton';

export default function RetryButton({ onClick, children = 'Retry', className = '' }) {
  return (
    <SkeuomorphicRectButton
      width={334}
      height={56}
      gradientId="retry-button-gradient"
      onClick={onClick}
      className={className}
      data-testid="retry-button"
    >
      <span
        style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontWeight: '500',
          fontSize: '16px',
          lineHeight: '22px',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        {children}
      </span>
    </SkeuomorphicRectButton>
  );
}
