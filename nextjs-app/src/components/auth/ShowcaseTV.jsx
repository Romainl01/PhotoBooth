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
 * - alt: string - Image alt text for accessibility
 */

'use client';

import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

// UI Constants
const ICON_SIZE = 16;
const ICON_PROPS = {
  size: ICON_SIZE,
  color: 'white',
  fill: 'white',
  strokeWidth: 0,
};

export default function ShowcaseTV({
  imageSrc = '/showcase/hero-photo.png',
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
      <div className="flex items-center justify-center w-full pb-[16px]">
        {/* Play/Pause Button */}
        <SkeuomorphicCircleButton
          diameter={54}
          gradientId="play-button-gradient"
          showRedLight={true}
          redLightFilterId="play-red-glow"
          className="w-[54px] h-[54px]"
        >
          {/* Play/Pause Icons (side by side) */}
          <foreignObject x="0" y="0" width="54" height="54">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                gap: '2px',
                paddingBottom: '12px',
              }}
            >
              <Play {...ICON_PROPS} />
              <Pause {...ICON_PROPS} />
            </div>
          </foreignObject>
        </SkeuomorphicCircleButton>
      </div>
    </div>
  );
}
