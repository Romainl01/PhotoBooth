/**
 * ErrorLayout Component - Skeumorphic Design (Tailwind v3)
 *
 * Reusable layout for error screens:
 * - Screen 3: Camera Access Error
 * - Screen 4: Generic API Error
 *
 * Features:
 * - Centered error icon (88x88px)
 * - Heading and message with proper spacing
 * - SVG-based skeumorphic retry button
 */

import RetryButton from './RetryButton';

export default function ErrorLayout({
  icon,
  heading,
  message,
  onRetry,
  buttonText = 'Retry',
}) {
  return (
    <div className="bg-background flex flex-col items-center h-full w-full">
      {/* Full page container */}
      <div className="flex-1 flex flex-col gap-2.5 items-center justify-center w-full">
        {/* Error message container - 334px width */}
        <div className="flex flex-col gap-[32px] items-center w-error-message">
          {/* Error Icon - 88x88px */}
          <div className="w-error-icon h-error-icon relative shrink-0">
            {icon}
          </div>

          {/* Text content - 24px gap between heading and message */}
          <div className="flex flex-col gap-6 items-start leading-normal-custom text-center text-text-primary w-full">
            <p className="font-mono font-bold text-heading w-full">
              {heading}
            </p>
            <p className="font-mono font-medium text-body w-full">
              {message}
            </p>
          </div>

          {/* Retry Button - SVG-based skeumorphic */}
          <RetryButton onClick={onRetry}>
            {buttonText}
          </RetryButton>
        </div>
      </div>

      {/* Bottom Spacer (for iPhone home indicator area) */}
      <div className="h-[40px] w-full bg-background" />
    </div>
  );
}
