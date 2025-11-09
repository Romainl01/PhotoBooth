/**
 * MorpheoLogo Component
 *
 * Logo for Morpheo sign-in page featuring:
 * - Camera icon with red recording indicator (reuses CaptureIcon)
 * - "Morpheo" brand name in Crimson Pro Bold
 *
 * Props:
 * - showRedDot: boolean (default: true) - Show/hide recording indicator
 */

import CaptureIcon from '../icons/CaptureIcon';

export default function MorpheoLogo({ showRedDot = true }) {
  return (
    <div className="flex items-center gap-[16px] justify-center">
      {/* Camera Icon with Red Dot */}
      <div className="w-[72px] h-[72px] relative">
        <CaptureIcon className="w-full h-full" iconType="camera" />
        {/* Red dot is already part of CaptureIcon component */}
      </div>

      {/* Morpheo Text */}
      <h1
        className="font-bold text-[40px] leading-[48px] text-black"
        style={{ fontFamily: 'var(--font-crimson-pro)' }}
      >
        Morpheo
      </h1>
    </div>
  );
}
