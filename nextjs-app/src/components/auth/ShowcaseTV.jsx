/**
 * ShowcaseTV Component
 *
 * Skeuomorphic TV component displaying AI-generated showcase photos
 * Features:
 * - Dark rounded container with layered shadows (mimics physical TV)
 * - Inner shadow frame for depth effect
 * - 1px black inner border with glass reflection effect
 * - Accepts dynamic content (VHSPlayback, etc.) or static image
 * - Supports embedded CTA buttons (via buttonContent prop)
 *
 * Props:
 * - children: ReactNode - Dynamic content to display in TV screen (e.g., VHSPlayback)
 * - imageSrc: string (optional) - Fallback static image if no children provided
 * - alt: string - Image alt text for accessibility
 * - buttonContent: ReactNode - Button to display in bottom bar (e.g., GoogleButton)
 */

'use client';

import Image from 'next/image';

export default function ShowcaseTV({
  children,
  imageSrc,
  alt = 'AI-generated photo showcasing Morpheo\'s capabilities',
  buttonContent,
}) {
  return (
    <div
      className="
        bg-[#272727]
        rounded-[44px]
        border-[1px] border-black
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        w-[338px] md:w-[800px]
      "
    >
      {/* Camera POV Frame */}
      <div className="p-[12px] rounded-[20px]">
        {/* Shadow Frame - Contains photo/content with inner border + shadow effects */}
        <div
          className="
            relative
            rounded-[32px]
            border-[1px] border-black/40
            shadow-[0px_4px_4px_0px_rgba(255,255,255,0.15),0px_4px_4px_0px_rgba(0,0,0,0.25)]
            h-[338px] md:h-[456px]
            w-full
          "
          style={{
            overflow: 'hidden',
            isolation: 'isolate',
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Inner clipping wrapper for Safari mobile compatibility */}
          <div
            className="absolute inset-0 rounded-[32px]"
            style={{
              overflow: 'hidden',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              maskImage: 'radial-gradient(white, black)',
            }}
          >
            {/* Dynamic Content (VHSPlayback, etc.) or Static Image */}
            {children ? (
              children
            ) : imageSrc ? (
              <Image
                src={imageSrc}
                alt={alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 338px, 800px"
              />
            ) : null}
          </div>

          {/* Layered Shadow Effects for Depth */}
          <div className="
            absolute inset-0 pointer-events-none
            shadow-[0px_2px_40px_0px_inset_rgba(0,0,0,0.5),0px_2px_12px_0px_inset_rgba(0,0,0,0.8)]
          " />

          {/* Glass Reflection Effect (subtle top highlight) */}
          <div className="
            absolute inset-0 pointer-events-none
            shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.08)]
          " />
        </div>
      </div>

      {/* Button Bar (bottom section on gray background) */}
      {buttonContent && (
        <div className="flex items-center justify-center w-full pb-[16px] px-[32px]">
          {buttonContent}
        </div>
      )}
    </div>
  );
}
