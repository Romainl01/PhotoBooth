/**
 * ShowcaseTV Component
 *
 * Skeuomorphic TV component displaying AI-generated showcase photos
 * Features:
 * - Dark rounded container with layered shadows (mimics physical TV)
 * - Inner shadow frame for depth effect
 * - Static photo display (Phase 1)
 * - Play/Pause button (non-functional in Phase 1)
 * - Red recording indicator light
 *
 * Props:
 * - imageSrc: string (required) - Path to showcase photo
 * - showControls: boolean (default: false) - Show play/pause controls (Phase 2)
 * - alt: string - Image alt text for accessibility
 */

'use client';

import Image from 'next/image';
import { Play, Pause } from 'lucide-react';

export default function ShowcaseTV({
  imageSrc = '/showcase/hero-photo.png',
  showControls = false,
  alt = 'AI-generated photo showcasing Morpheo\'s capabilities',
}) {
  return (
    <div
      className="
        bg-[#272727]
        rounded-[44px]
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        flex flex-col
        w-[338px] md:w-[800px]
      "
    >
      {/* Camera POV Frame */}
      <div className="p-[12px] rounded-[20px]">
        {/* Shadow Frame - Contains photo with inner/outer shadows */}
        <div
          className="
            relative
            rounded-[32px]
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

          {/* Inner Shadow Overlay (for depth effect) */}
          <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_40px_0px_inset_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Button Bar (bottom section) */}
      <div className="flex items-center justify-center w-full">
        <div className="
          bg-[#272727]
          flex items-center justify-between
          px-[32px] pb-[16px] pt-0
          rounded-[16px]
          w-full
        ">
          {/* Play/Pause Button (static in Phase 1) */}
          <div className="relative w-[54px] h-[54px] mx-auto">
            {/* Outer circle (border gradient effect) */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 54 54" className="w-full h-full">
                <defs>
                  <linearGradient id="button-gradient" x1="27" y1="0" x2="27" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#858484" />
                    <stop offset="1" stopColor="#000000" />
                  </linearGradient>
                </defs>
                <circle cx="27" cy="27" r="27" fill="url(#button-gradient)" />
              </svg>
            </div>

            {/* Inner circle (dark background) */}
            <div className="absolute top-[2.455px] left-[2.455px] w-[49.091px] h-[49.091px]">
              <svg viewBox="0 0 49.091 49.091" className="w-full h-full">
                <circle cx="24.545" cy="24.545" r="24.545" fill="#232323" />
              </svg>
            </div>

            {/* Play/Pause Icons Container */}
            <div className="absolute top-[14px] left-[12px] flex items-center w-[29.454px] h-[14.727px]">
              {/* Play Icon (visible by default) */}
              <Play size={16} color="white" className="absolute" />

              {/* Pause Icon (hidden in Phase 1) */}
              <Pause size={16} color="white" className="absolute hidden" />
            </div>

            {/* Red Recording Light */}
            <div className="absolute bottom-[6px] right-[14px] w-[3.682px] h-[3.682px]">
              <div className="w-full h-full rounded-full bg-[#FF0000]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
