/**
 * File Size Error Screen
 *
 * Displayed when user uploads a file exceeding the maximum size limit.
 * Shows error message with size limit and retry button.
 */

import ErrorLayout from '../ui/ErrorLayout';
import CaptureIcon from '../icons/CaptureIcon';

export default function FileSizeError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="File too large"
      message="Maximum file size is 10MB. Please choose a smaller image."
      onRetry={onRetry}
      buttonText="Upload another"
    />
  );
}
