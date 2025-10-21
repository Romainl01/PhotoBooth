/**
 * Button Component - Skeumorphic Design (Tailwind v3)
 *
 * Scalable button that works at any size with proper border proportions
 * Supports two variants:
 * - primary: Main action button (e.g., "Contact me", "Retry")
 * - secondary: Not currently used but available for extension
 *
 * Features skeumorphic depth with:
 * - Outer border layer (black)
 * - Inner button with gradient border
 * - Proper spacing and typography
 */

'use client';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-black
        overflow-hidden
        p-[3px]
        rounded-[19px]
        w-full
        cursor-pointer
        transition-transform
        active:scale-button-press
        disabled:opacity-50
        disabled:cursor-not-allowed
        border-0
        outline-none
        focus:outline-none
        ${className}
      `}
      {...props}
    >
      <div
        className="rounded-[16px] w-full relative"
        style={{
          padding: '2px',
          background: 'linear-gradient(180deg, #666666 0%, #000000 100%)',
        }}
      >
        <div
          className="
            bg-[#232323]
            rounded-[13px]
            w-full
            py-[16px]
            px-[16px]
            flex
            items-center
            justify-center
            text-text-primary
            font-mono
            font-medium
            text-body
            leading-[22px]
          "
        >
          {children}
        </div>
      </div>
    </button>
  );
}
