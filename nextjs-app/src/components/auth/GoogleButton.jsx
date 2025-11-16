/**
 * GoogleButton Component
 *
 * "Continue with Google" CTA button:
 * - Uses SkeuomorphicRectButton base component
 * - Google icon + text label
 * - Responsive width (full width mobile, 800px desktop)
 *
 * Props:
 * - onClick: function (optional) - Button click handler
 * - disabled: boolean (default: false) - Disable button interaction
 */

'use client';

import SkeuomorphicRectButton from '../ui/SkeuomorphicRectButton';

export default function GoogleButton({ onClick, disabled = false }) {
  return (
    <SkeuomorphicRectButton
      width={334}
      height={56}
      gradientId="google-button-gradient"
      onClick={onClick}
      disabled={disabled}
      className="w-full md:w-[800px] h-[56px]"
      data-testid="sign-in-button"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Google Icon */}
        <img
          src="/icons/google.svg"
          alt="Google"
          width="20"
          height="20"
          style={{ flexShrink: 0 }}
        />

        {/* Button Text */}
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontWeight: '500',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          Continue with Google
        </span>
      </div>
    </SkeuomorphicRectButton>
  );
}
