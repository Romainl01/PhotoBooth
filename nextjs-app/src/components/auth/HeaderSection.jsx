/**
 * HeaderSection Component
 *
 * New landing page header featuring:
 * - Gradient background blur (yellow/gold at top)
 * - "Morpheo" brand title (Crimson Pro Bold, 64px desktop / 48px mobile)
 * - Horizontal divider line
 * - "Made with love by Romain Lagrange" subtitle (Crimson Pro Medium Italic)
 * - Tagline: "One selfie, infinite possibilities"
 * - Weekly stats counter
 *
 * Design: Based on Figma sign-in screen desktop design
 */

export default function HeaderSection({ variant = 'full' }) {
  const isSimple = variant === 'simple';

  return (
    <div className={`
      flex
      flex-col
      gap-[24px]
      md:gap-[24px]
      items-center
      w-full
      max-w-[1400px]
      pt-[4px]
      md:pt-[8px]
      pb-0
      ${isSimple ? 'mb-[48px]' : ''}
    `}>
      {/* Header: Title + Divider + Subtitle */}
      <div className="
        flex
        flex-col
        gap-[4px]
        items-center
        w-full
      ">
        {/* Morpheo Title with Divider Line */}
        <div className="
          flex
          flex-col
          items-center
          w-full
        ">
          {/* Title with bottom border */}
          <h1
            className="
              text-[56px]
              md:text-[80px]
              leading-none
              font-bold
              text-black
              pb-[8px]
              border-b
              border-black/30
              w-full
              text-center
            "
            style={{ fontFamily: 'var(--font-crimson-pro)' }}
          >
            Morpheo
          </h1>
        </div>

        {/* Subtitle - Only show in full variant */}
        {!isSimple && (
          <p
            className="
              text-[16px]
              leading-[24px]
              font-medium
              italic
              text-black
              text-center
            "
            style={{ fontFamily: 'var(--font-crimson-pro)' }}
          >
            Made with love by Romain Lagrange
          </p>
        )}
      </div>

      {/* Text Frame - Tagline + Stats - Only show in full variant */}
      {!isSimple && (
        <div className="
          flex
          flex-col
          gap-[8px]
          items-center
          w-full
          text-center
        ">
          {/* Tagline */}
          <p className="
            font-['IBM_Plex_Mono']
            font-semibold
            text-[14px]
            md:text-[16px]
            leading-[28px]
            md:leading-[32px]
            text-black
          ">
            One selfie, infinite possibilities
          </p>

          {/* Stats */}
          <p className="
            font-['IBM_Plex_Mono']
            font-semibold
            text-[11px]
            md:text-[12px]
            leading-[22px]
            md:leading-[24px]
            text-black
          ">
            ⚡️ 1,576 photos created this week
          </p>
        </div>
      )}
    </div>
  );
}
