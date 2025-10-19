/**
 * IconButton Component - Skeumorphic Design (Tailwind v3)
 *
 * Used for circular icon buttons like:
 * - Upload button (gallery icon)
 * - Camera switch button (flip camera icon)
 * - Share button
 * - Download button
 * - Filter navigation arrows
 *
 * Variants:
 * - main: Large button (88px) - used for main capture/retry actions
 * - secondary: Medium button (64px) - used for upload, camera switch, share, download
 * - nav: Small button (48px) - used for filter navigation arrows
 */

export default function IconButton({
  children,
  onClick,
  variant = 'secondary',
  className = '',
  disabled = false,
  ariaLabel,
  ...props
}) {
  const sizeClasses = {
    main: 'w-button-main h-button-main',
    secondary: 'w-button-secondary h-button-secondary',
    nav: 'w-button-nav h-button-nav',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${sizeClasses[variant]}
        flex
        items-center
        justify-center
        cursor-pointer
        transition-transform
        active:scale-[0.97]
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
