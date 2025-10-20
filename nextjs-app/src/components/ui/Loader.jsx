/**
 * Loader Component
 *
 * Full-screen overlay with:
 * - Optional captured photo preview in background
 * - Semi-transparent dark background overlay
 * - Skeumorphic loading icon with yellow animated spinner
 * - Loading text below
 * - Appears over the camera screen
 */

'use client';

import LoadingIcon from '../icons/LoadingIcon';

export default function Loader({ message = 'Loading...', imageUrl = null }) {
  return (
    <div className="absolute inset-0 z-50 animate-fadeIn pointer-events-none flex flex-col justify-between px-[12px] py-[8px] md:p-0">
      {/* Loading overlay only over camera preview area */}
      <div className="flex-1 min-h-0 rounded-[32px] overflow-hidden relative bg-camera-bg md:absolute md:inset-0 md:rounded-none md:flex-none">
          {/* Captured photo preview (if available) */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Captured photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Dark overlay over camera area only */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Loading content centered in camera area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col gap-4 items-center">
              {/* Skeumorphic loading icon */}
              <LoadingIcon className="w-[88px] h-[88px]" />

              {/* Loading message */}
              <p className="font-mono font-medium text-body text-text-primary text-center">
                {message}
              </p>
            </div>
          </div>
      </div>

      {/* Invisible spacer to match controls section height - prevents camera area from expanding (mobile only) */}
      <div className="h-auto invisible md:hidden">
        {/* This matches the height of the controls section in CameraScreen */}
        <div className="h-[64px]" /> {/* Button bar height */}
        <div className="h-[52px]" /> {/* Filter selector height */}
        <div className="h-[40px]" /> {/* iPhone spacer */}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 150ms ease-out 200ms both;
        }
      `}</style>
    </div>
  );
}
