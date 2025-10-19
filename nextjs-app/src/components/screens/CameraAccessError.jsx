/**
 * Screen 3: Camera Access Error
 *
 * Displayed when the app cannot access the camera.
 * Shows error message and retry button to request permission again.
 */

import ErrorLayout from '../ui/ErrorLayout';
import CaptureIcon from '../icons/CaptureIcon';

export default function CameraAccessError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="Camera error"
      message="Photo could not access your camera. Pleach check your browser permissions."
      onRetry={onRetry}
      buttonText="Retry"
    />
  );
}
