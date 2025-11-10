/**
 * ShowcaseTV Component
 *
 * Skeuomorphic TV component displaying AI-generated showcase photos
 * Features:
 * - Dark rounded container with layered shadows (mimics physical TV)
 * - Inner shadow frame for depth effect
 * - 1px black inner border with glass reflection effect
 * - Static photo display (Phase 1)
 * - Supports embedded CTA buttons (via children prop)
 *
 * Props:
 * - imageSrc: string (required) - Path to showcase photo
 * - alt: string - Image alt text for accessibility
 * - children: ReactNode - Content to overlay on photo (e.g., buttons)
 */

'use client';

import Image from 'next/image';

export default function ShowcaseTV({
  imageSrc = '/showcase/hero-photo.png',
  alt = 'AI-generated photo showcasing Morpheo\'s capabilities',
  children,
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
        {/* Shadow Frame - Contains photo with inner border + shadow effects */}
        <div
          className="
            relative
            rounded-[32px]
            border-[1px] border-black/40
            shadow-[0px_4px_4px_0px_rgba(255,255,255,0.15),0px_4px_4px_0px_rgba(0,0,0,0.25)]
            overflow-hidden
            h-[338px] md:h-[456px]
            w-full
          "
        >
          {/* Showcase Photo */}
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 338px, 800px"
          />

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
      {children && (
        <div className="flex items-center justify-center w-full pb-[16px] px-[32px]">
          {children}
        </div>
      )}
    </div>
  );
}
