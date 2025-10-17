/**
 * ErrorLayout Component - Skeumorphic Design (Tailwind v3)
 *
 * Reusable layout for error screens:
 * - Screen 3: Camera Access Error
 * - Screen 4: Generic API Error
 *
 * Features:
 * - Centered error icon
 * - Heading and message
 * - Retry button
 */

import Button from './Button';
import IconButton from './IconButton';

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
        {/* Error message container */}
        <div className="flex flex-col gap-8 items-center w-error-message">
          {/* Error Icon */}
          <IconButton
            variant="main"
            disabled
            className="pointer-events-none"
          >
            {icon}
          </IconButton>

          {/* Text content */}
          <div className="flex flex-col gap-6 items-start leading-normal-custom text-center text-text-primary w-full">
            <p className="font-mono font-bold text-heading w-full">
              {heading}
            </p>
            <p className="font-mono font-medium text-body w-full">
              {message}
            </p>
          </div>

          {/* Retry Button */}
          <Button onClick={onRetry}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
