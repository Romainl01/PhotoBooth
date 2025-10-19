/**
 * CaptureIcon Component
 *
 * Custom camera capture button icon with:
 * - Skeumorphic double-border design
 * - Linear gradient stroke
 * - Camera or no-camera icon (based on iconType prop)
 * - Red recording indicator with glow
 */

'use client';

export default function CaptureIcon({ className = '', iconType = 'camera' }) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Linear gradient for border */}
        <linearGradient
          id="capture-gradient"
          x1="44"
          y1="4"
          x2="44"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#858484" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>

        {/* Glow filter for red light */}
        <filter
          id="red-glow"
          x="33"
          y="53"
          width="22"
          height="22"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur" />
        </filter>
      </defs>

      {/* Outer black circle */}
      <circle cx="44" cy="44" r="44" fill="#000000" />

      {/* Inner circle with gradient border */}
      <circle cx="44" cy="44" r="40" fill="#232323" />
      <circle
        cx="44"
        cy="44"
        r="40"
        stroke="url(#capture-gradient)"
        strokeOpacity="0.6"
        strokeWidth="2"
        fill="none"
      />

      {/* Icon - Camera or No-Camera based on iconType */}
      {iconType === 'camera' ? (
        <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
          {/* Camera body path */}
          <path
            d="M35.3783 26.2917C35.0783 26.7665 34.678 27.17 34.2056 27.4737C33.7331 27.7775 33.1999 27.9742 32.6433 28.05C32.01 28.14 31.3817 28.2367 30.7533 28.3417C28.9983 28.6333 27.75 30.1783 27.75 31.9567V46C27.75 46.9946 28.1451 47.9484 28.8483 48.6516C29.5516 49.3549 30.5054 49.75 31.5 49.75H56.5C57.4946 49.75 58.4484 49.3549 59.1516 48.6516C59.8549 47.9484 60.25 46.9946 60.25 46V31.9567C60.25 30.1783 59 28.6333 57.2467 28.3417C56.6179 28.2369 55.9878 28.1397 55.3567 28.05C54.8004 27.9739 54.2675 27.7771 53.7954 27.4734C53.3232 27.1697 52.9232 26.7663 52.6233 26.2917L51.2533 24.0983C50.9456 23.5985 50.522 23.1802 50.0184 22.8787C49.5148 22.5773 48.9459 22.4017 48.36 22.3667C45.4554 22.2107 42.5446 22.2107 39.64 22.3667C39.0541 22.4017 38.4852 22.5773 37.9816 22.8787C37.478 23.1802 37.0544 23.5985 36.7467 24.0983L35.3783 26.2917Z"
            strokeWidth="3"
            fill="none"
          />
          {/* Camera lens and flash */}
          <path
            d="M51.5 37.25C51.5 39.2391 50.7098 41.1468 49.3033 42.5533C47.8968 43.9598 45.9891 44.75 44 44.75C42.0109 44.75 40.1032 43.9598 38.6967 42.5533C37.2902 41.1468 36.5 39.2391 36.5 37.25C36.5 35.2609 37.2902 33.3532 38.6967 31.9467C40.1032 30.5402 42.0109 29.75 44 29.75C45.9891 29.75 47.8968 30.5402 49.3033 31.9467C50.7098 33.3532 51.5 35.2609 51.5 37.25ZM55.25 33.5H55.2633V33.5133H55.25V33.5Z"
            strokeWidth="2"
            fill="none"
          />
        </g>
      ) : (
        <g transform="translate(24, 20)">
          <path d="M11.3783 10.292C11.0783 10.7669 10.678 11.1703 10.2056 11.4741C9.73309 11.7778 9.19988 11.9745 8.64333 12.0503C8.01 12.1403 7.38167 12.237 6.75333 12.342C4.99833 12.6337 3.75 14.1787 3.75 15.957V30.0003C3.75 30.9949 4.14509 31.9487 4.84835 32.652C5.55161 33.3553 6.50544 33.7503 7.5 33.7503H32.5C33.4946 33.7503 34.4484 33.3553 35.1516 32.652C35.8549 31.9487 36.25 30.9949 36.25 30.0003V15.957C36.25 14.1787 35 12.6337 33.2467 12.342C32.6179 12.2372 31.9878 12.14 31.3567 12.0503C30.8004 11.9743 30.2675 11.7775 29.7954 11.4737C29.3232 11.17 28.9232 10.7667 28.6233 10.292L27.2533 8.09868C26.9456 7.59884 26.522 7.1805 26.0184 6.87907C25.5148 6.57764 24.9459 6.402 24.36 6.36701C21.4554 6.211 18.5446 6.211 15.64 6.36701C15.0541 6.402 14.4852 6.57764 13.9816 6.87907C13.478 7.1805 13.0544 7.59884 12.7467 8.09868L11.3783 10.292Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M27.5 21.25C27.5 23.2391 26.7098 25.1468 25.3033 26.5533C23.8968 27.9598 21.9891 28.75 20 28.75C18.0109 28.75 16.1032 27.9598 14.6967 26.5533C13.2902 25.1468 12.5 23.2391 12.5 21.25C12.5 19.2609 13.2902 17.3532 14.6967 15.9467C16.1032 14.5402 18.0109 13.75 20 13.75C21.9891 13.75 23.8968 14.5402 25.3033 15.9467C26.7098 17.3532 27.5 19.2609 27.5 21.25ZM31.25 17.5H31.2633V17.5133H31.25V17.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 5L38 36" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        </g>
      )}

      {/* Red recording light with glow */}
      <g opacity="0.5" filter="url(#red-glow)">
        <circle cx="44" cy="64" r="6" fill="#CD0E0E" />
      </g>
      <circle cx="44" cy="64" r="3" fill="#FF0000" />
    </svg>
  );
}
