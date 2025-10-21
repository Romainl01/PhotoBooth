/**
 * Loader Component
 *
 * Responsive loading overlay with:
 * - Optional captured photo preview in background
 * - Semi-transparent dark background overlay
 * - Skeumorphic loading icon with yellow animated spinner
 * - Loading text below
 *
 * Mobile: Covers camera preview area only, leaves buttons visible
 * Desktop: Full-screen coverage
 */

'use client';

import LoadingIcon from '../icons/LoadingIcon';

export default function Loader({ message = 'Loading...', imageUrl = null }) {
  return (
    <>
      {/* Unified loader for mobile and desktop */}
      <div className="absolute top-[8px] md:top-0 left-[12px] md:left-0 right-[12px] md:right-0 bottom-[calc(16px+88px+16px+52px+40px+8px)] md:bottom-0 z-50 animate-fadeIn pointer-events-none">
        <div className="bg-camera-bg h-full relative rounded-[32px] md:rounded-none shadow-camera-view md:shadow-none overflow-hidden">
          {/* Captured photo preview (if available) */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Captured photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Loading content centered */}
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

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none shadow-camera-inner md:shadow-none" />
        </div>
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
    </>
  );
}
