/**
 * Screen 2: Generated Image Result
 *
 * Displays the generated image with three actions:
 * - Share: Opens native share dialog
 * - New Photo: Returns to camera screen
 * - Download: Downloads the image to device
 */

'use client';

import IconButton from '../ui/IconButton';
import ShareIcon from '../icons/ShareIcon';
import RetryIcon from '../icons/RetryIcon';
import DownloadIcon from '../icons/DownloadIcon';

export default function ResultScreen({
  imageUrl,
  onNewPhoto,
  onShare,
  onDownload,
}) {
  const handleShare = async () => {
    if (navigator.share && imageUrl) {
      try {
        // Fetch the image and convert to blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'grain-photo.jpg', { type: 'image/jpeg' });

        await navigator.share({
          files: [file],
          title: 'Grain Photo',
          text: 'Check out my Grain photo!',
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to onShare callback if provided
        onShare?.();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      onShare?.();
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `grain-photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  return (
    <div className="bg-background flex flex-col justify-between h-full w-full px-[12px] py-[8px]">
      {/* Generated Image Preview */}
      <div className="flex-1 bg-camera-bg min-h-0 relative rounded-[32px] shadow-camera-view overflow-hidden w-full">
          {/* Generated image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated result"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-primary">
              Loading...
            </div>
          )}

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none shadow-camera-inner" />
      </div>

      {/* Controls Section */}
      <div className="flex flex-col items-start w-full">
        <div className="bg-background flex flex-col items-center overflow-hidden py-button-bar-y rounded-controls w-full">
          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 h-24 items-end justify-center w-full">
            <div className="flex-1 flex gap-button-gap items-center justify-center px-button-bar-x py-button-bar-y w-full">
              {/* Share Button */}
              <IconButton
                variant="secondary"
                onClick={handleShare}
                ariaLabel="Share photo"
              >
                <ShareIcon className="w-full h-full" />
              </IconButton>

              {/* New Photo Button (Retry/Loop) */}
              <IconButton
                variant="secondary"
                onClick={onNewPhoto}
                ariaLabel="Take new photo"
              >
                <RetryIcon className="w-full h-full" />
              </IconButton>

              {/* Download Button */}
              <IconButton
                variant="secondary"
                onClick={handleDownload}
                ariaLabel="Download photo"
              >
                <DownloadIcon className="w-full h-full" />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Bottom Spacer (for iPhone home indicator area) */}
        <div className="h-[16px] w-full bg-background" />
      </div>
    </div>
  );
}
