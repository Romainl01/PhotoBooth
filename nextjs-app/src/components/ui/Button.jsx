/**
 * Button Component - Skeumorphic Design (Tailwind v3)
 *
 * Supports two variants:
 * - primary: Main action button (e.g., "Retry")
 * - secondary: Not currently used but available for extension
 *
 * Features skeumorphic depth with:
 * - Outer border layer (black)
 * - Inner button with border
 * - Proper spacing and typography
 */

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className="bg-border-outer overflow-hidden p-filter-border rounded-button-outer w-full">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          bg-button-bg
          border-2
          border-border-primary
          border-solid
          rounded-button
          w-full
          p-button-padding
          flex
          items-center
          justify-center
          text-text-primary
          font-mono
          text-body
          leading-normal-custom
          cursor-pointer
          transition-transform
          active:scale-95
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
