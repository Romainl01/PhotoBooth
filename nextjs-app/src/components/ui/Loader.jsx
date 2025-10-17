/**
 * Loader Component
 *
 * Displays a loading spinner with optional message
 * Shown while waiting for API response
 */

'use client';

export default function Loader({ message = 'Generating your photo...' }) {
  return (
    <div className="bg-background flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col gap-8 items-center">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#232323] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-text-accent border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading message */}
        <p className="font-mono font-medium text-body text-text-primary text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
