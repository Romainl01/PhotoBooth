/**
 * Screen 2: Generated Image Result
 *
 * Displays the generated image with three actions:
 * - Share: Opens native share dialog
 * - New Photo: Returns to camera screen
 * - Download: Desktop downloads file, Mobile opens share dialog (allows saving to Photos)
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
  isMobile = false,
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

  const handleDownload = async () => {
    // On mobile, use Web Share API to allow saving to Photos
    if (isMobile && navigator.share && imageUrl) {
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

        onDownload?.();
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to standard download on error
        if (imageUrl) {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `grain-photo-${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        onDownload?.();
      }
    } else {
      // Desktop: Standard download behavior
      if (imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `grain-photo-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      onDownload?.();
    }
  };

  return (
    <div className="bg-background flex flex-col justify-between h-full w-full px-[12px] py-[8px] md:p-0 md:relative">
      {/* Generated Image Preview */}
      <div className="flex-1 bg-camera-bg min-h-0 relative rounded-[32px] shadow-camera-view overflow-hidden w-full md:absolute md:inset-0 md:rounded-none md:shadow-none">
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
          <div className="absolute inset-0 pointer-events-none shadow-camera-inner md:shadow-none" />
      </div>

      {/* Controls Section - Floating on desktop */}
      <div className="flex flex-col items-start w-full md:absolute md:bottom-[16px] md:left-1/2 md:-translate-x-1/2 md:w-[344px] md:z-10">
        <div className="bg-background flex flex-col items-center overflow-hidden py-button-bar-y rounded-controls w-full md:rounded-[16px] md:shadow-[0px_12px_24px_rgba(0,0,0,0.4),0px_6px_12px_rgba(0,0,0,0.5)] md:py-0">
          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 h-24 items-end justify-center w-full md:h-auto md:flex-col-reverse md:gap-0">
            <div className="flex-1 flex gap-button-gap items-center justify-center px-button-bar-x py-button-bar-y w-full md:gap-[32px] md:px-[32px] md:py-[16px] md:flex-initial">
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

        {/* Bottom Spacer (for iPhone home indicator area) - hidden on desktop */}
        <div className="h-[40px] w-full bg-background md:hidden" />
      </div>
    </div>
  );
}
