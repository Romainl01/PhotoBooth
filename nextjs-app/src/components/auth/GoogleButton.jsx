/**
 * GoogleButton Component
 *
 * "Continue with Google" CTA button matching Figma design:
 * - Two-layer border effect (outer black, inner gradient)
 * - Google icon + text label
 * - Responsive width (full width mobile, 800px desktop)
 * - Reuses RetryButton styling pattern
 *
 * Props:
 * - onClick: function (optional) - Button click handler
 * - disabled: boolean (default: false) - Disable button interaction
 */

'use client';

import Image from 'next/image';

export default function GoogleButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Sign in with Google"
      className="
        w-full md:w-[800px]
        cursor-pointer
        transition-transform
        active:scale-button-press
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        focus-visible:ring-offset-2
      "
    >
      {/* Outer black border container */}
      <div className="bg-black p-[3px] rounded-[19px] w-full">
        {/* Inner button with border and background */}
        <div
          className="
            bg-[#232323]
            border-2
            border-[#666666]
            rounded-[16px]
            p-[16px]
            flex
            items-center
            justify-center
            gap-[10px]
            hover:border-[#888888]
            transition-colors
            duration-200
          "
        >
          {/* Google Icon */}
          <div className="relative w-[20px] h-[20px] shrink-0">
            <Image
              src="/icons/google.png"
              alt="Google"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>

          {/* Button Text */}
          <span
            className="
              font-['IBM_Plex_Mono']
              font-medium
              text-[16px]
              leading-[22px]
              text-white
              text-center
              whitespace-nowrap
            "
          >
            Continue with Google
          </span>
        </div>
      </div>
    </button>
  );
}
