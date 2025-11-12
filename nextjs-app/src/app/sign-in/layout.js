/**
 * Sign-In Route Layout
 *
 * Overrides root layout settings for the /sign-in page:
 * - Sets gray theme color for Safari mobile browser chrome
 * - Executes early script to set html background before React hydration
 *
 * This ensures Safari mobile displays gray (#e3e3e3) behind the status bar
 * and bottom navigation, matching the sign-in page design.
 */

export const metadata = {
  themeColor: '#e3e3e3', // Gray theme for Safari browser chrome
};

export default function SignInRouteLayout({ children }) {
  return (
    <>
      {/* Early-executing script: Sets html background before React hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.style.backgroundColor = '#e3e3e3';`,
        }}
      />
      {children}
    </>
  );
}
