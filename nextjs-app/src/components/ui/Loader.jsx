/**
 * Loader Component
 *
 * Full-screen overlay with:
 * - Semi-transparent dark background overlay
 * - Skeumorphic loading icon with yellow animated spinner
 * - Loading text below
 * - Appears over the camera screen
 */

'use client';

import LoadingIcon from '../icons/LoadingIcon';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Full screen overlay */}
      <div className="absolute inset-0 bg-black/50" />

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

      {/* Loading content */}
      <div className="relative flex flex-col gap-4 items-center">
        {/* Skeumorphic loading icon */}
        <LoadingIcon className="w-[88px] h-[88px]" />

        {/* Loading message */}
        <p className="font-mono font-medium text-body text-text-primary text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
