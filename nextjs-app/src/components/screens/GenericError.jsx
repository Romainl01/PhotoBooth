/**
 * Screen 4: Generic API Error
 *
 * Displayed when image generation fails (API down, timeout, or other errors).
 * Shows error message and retry button to attempt generation again.
 */

import ErrorLayout from '../ui/ErrorLayout';
import CaptureIcon from '../icons/CaptureIcon';

export default function GenericError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="Something went wrong"
      message="We can't generate your photo right now. Please try again."
      onRetry={onRetry}
      buttonText="Retry"
    />
  );
}
