/**
 * SignInLayout Component
 *
 * Complete sign-in page layout composing:
 * - MorpheoLogo (camera icon + brand name)
 * - Text frame (tagline + stats)
 * - ShowcaseTV (skeuomorphic TV with hero photo)
 * - GoogleButton (Continue with Google CTA)
 *
 * Layout:
 * - Mobile-first responsive design
 * - Centered vertical stack with 24px gaps
 * - Light gray background (#e3e3e3)
 * - 32px horizontal padding
 *
 * Showcase Images:
 * - Responsive image selection based on viewport
 * - Desktop (≥768px): 9 landscape photos from /showcase/desktop/
 * - Mobile (<768px): 8 portrait photos from /showcase/mobile/
 * - Dynamic switching on resize using matchMedia
 *
 * Authentication:
 * - Google OAuth via Supabase
 * - Redirects to /auth/callback after consent
 * - Session managed via cookies
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import HeaderSection from './HeaderSection';
import ShowcaseTV from './ShowcaseTV';
import VHSPlayback from './VHSPlayback';
import GoogleButton from './GoogleButton';
import InAppBrowserModal from './InAppBrowserModal';
import { isInAppBrowser } from '../../lib/userAgent';

export default function SignInLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const [showInAppBrowserError, setShowInAppBrowserError] = useState(false);
  const supabase = createClient();

  // Ensure gray background for Safari mobile (already default, but set for client-side nav)
  // Ensure gray background for Safari mobile (already default, but set for client-side nav)
  useEffect(() => {
    // Save original styles
    const originalHtmlBg = document.documentElement.style.background;
    const originalBodyBg = document.body.style.backgroundColor;

    // Set solid gray background (Fixes Chrome & Safari Bottom)
    document.documentElement.style.background = '#e3e3e3';
    document.body.style.backgroundColor = '#e3e3e3';

    // Dynamic Theme Color Logic for Safari Top Overscroll
    const updateThemeColor = () => {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) return;

      // If at top (or near top), use Yellow. Otherwise, use Gray.
      const newColor = window.scrollY < 20 ? '#ffcc53' : '#e3e3e3';

      if (themeColorMeta.getAttribute('content') !== newColor) {
        themeColorMeta.setAttribute('content', newColor);
      }
    };

    // Initial check
    updateThemeColor();

    // Add listener
    window.addEventListener('scroll', updateThemeColor);

    // Cleanup: Restore original styles and remove listener
    return () => {
      document.documentElement.style.background = originalHtmlBg;
      document.body.style.backgroundColor = originalBodyBg;
      window.removeEventListener('scroll', updateThemeColor);

      // Reset theme color to default (dark gray)
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#242424');
      }
    };
  }, []);




  // Desktop showcase images (768px+)
  const desktopShowcaseImages = [
    '/showcase/desktop/morpheo-photo-1761176875650.jpg',
    '/showcase/desktop/morpheo-photo-1761231588775.jpg',
    '/showcase/desktop/morpheo-photo-1761239184895.jpg',
    '/showcase/desktop/morpheo-photo-1761593485876.jpg',
    '/showcase/desktop/morpheo-photo-1761652384030.jpg',
    '/showcase/desktop/morpheo-photo-1761652591619.jpg',
    '/showcase/desktop/morpheo-photo-1762967157364.jpg',
    '/showcase/desktop/morpheo-photo-1762967211271.jpg',
    '/showcase/desktop/morpheo-photo-1762967328177.jpg',
  ];

  // Mobile showcase images (<768px)
  const mobileShowcaseImages = [
    '/showcase/mobile/Mobile Kill Bill Emma.png',
    '/showcase/mobile/Mobile Kill Bill Thomas.png',
    '/showcase/mobile/Mobile Lord Romain.png',
    '/showcase/mobile/Mobile Matrix Romain.png',
    '/showcase/mobile/Mobile Star Wars Thomas.png',
    '/showcase/mobile/Mobile Star Wars Valentin.png',
    '/showcase/mobile/Mobile Zombie Samy.png',
    '/showcase/mobile/Samy.jpeg',
  ];

  // Viewport detection for responsive image selection
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect viewport size and handle resize
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    // Set initial value
    setIsDesktop(mediaQuery.matches);

    // Update on resize
    const handleChange = (e) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Select images based on viewport
  const showcaseImages = isDesktop ? desktopShowcaseImages : mobileShowcaseImages;

  const handleGoogleSignIn = async () => {
    if (isInAppBrowser(navigator.userAgent)) {
      setShowInAppBrowserError(true);
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth error:', error.message);
        alert('Failed to sign in with Google. Please try again.');
        setIsLoading(false);
      }

      // If successful, user will be redirected to Google
      // No need to reset loading state as page will navigate away
    } catch (err) {
      console.error('Unexpected error during sign-in:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="
      min-h-screen
      bg-[#e3e3e3]
      flex
      flex-col
      items-center
      justify-center
      py-[8px]
      md:py-[12px]
      px-[32px]
      overflow-x-hidden
      relative
    ">
      {/* Fixed Gradient Background - Stays at top during scroll */}
      <div
        className="
          fixed
          top-0
          left-0
          right-0
          h-[180px]
          md:h-[240px]
          bg-gradient-to-b
          from-[#ffcc53]
          via-[#ffcc53]/80
          via-[#ffcc53]/60
          via-[#ffcc53]/40
          via-[#ffcc53]/20
          via-[#ffcc53]/8
          to-transparent
          pointer-events-none
        "
        style={{
          zIndex: 0
        }}
      />

      {/* Content Container */}
      <div className="
        flex
        flex-col
        gap-[24px]
        items-center
        w-full
        max-w-[1400px]
        relative
        z-10
      ">
        {/* New Header Section with Gradient */}
        <HeaderSection />

        {/* In-App Browser Error Modal */}
        {showInAppBrowserError && (
          <InAppBrowserModal onDismiss={() => setShowInAppBrowserError(false)} />
        )}

        {/* VHS Playback in TV Frame */}
        <ShowcaseTV
          buttonContent={
            <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading} />
          }
        >
          <VHSPlayback images={showcaseImages} />
        </ShowcaseTV>
      </div>
    </main>
  );
}
