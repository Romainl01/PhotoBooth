/**
 * Screen 4: Generic API Error
 *
 * Displayed when image generation fails (API down, timeout, or other errors).
 * Shows error message and retry button to attempt generation again.
 */

import ErrorLayout from '../ui/ErrorLayout';

export default function GenericError({ onRetry }) {
  const errorIcon = (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Camera with slash icon - represents generation failure */}
      <circle cx="44" cy="44" r="42" fill="#1C1C1E" stroke="#666666" strokeWidth="4"/>
      <g transform="translate(24, 24)">
        {/* Camera icon */}
        <path
          d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
        {/* Slash */}
        <line x1="2" y1="22" x2="22" y2="2" stroke="#FF0000" strokeWidth="3" strokeLinecap="round"/>
      </g>
      {/* Red dot indicator */}
      <circle cx="66" cy="66" r="6" fill="#FF0000"/>
    </svg>
  );

  return (
    <ErrorLayout
      icon={errorIcon}
      heading="Something went wrong"
      message="We can't generate your photo right now. Please try again."
      onRetry={onRetry}
      buttonText="Retry"
    />
  );
}
