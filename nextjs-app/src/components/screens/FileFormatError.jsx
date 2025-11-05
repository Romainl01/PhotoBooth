/**
 * File Format Error Screen
 *
 * Displayed when user uploads an unsupported file format.
 * Shows error message listing supported formats and retry button.
 */

import ErrorLayout from '../ui/ErrorLayout';
import CaptureIcon from '../icons/CaptureIcon';

export default function FileFormatError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="Unsupported file format"
      message="Please upload JPEG, PNG, or WebP images only."
      onRetry={onRetry}
      buttonText="Upload Another"
    />
  );
}
