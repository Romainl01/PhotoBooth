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
 * Authentication:
 * - Google OAuth via Supabase
 * - Redirects to /auth/callback after consent
 * - Session managed via cookies
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import MorpheoLogo from './MorpheoLogo';
import ShowcaseTV from './ShowcaseTV';
import VHSPlayback from './VHSPlayback';
import GoogleButton from './GoogleButton';

export default function SignInLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Showcase images
  const showcaseImages = [
    '/showcase/mobile/Mobile Kill Bill Emma.png',
    '/showcase/mobile/Mobile Kill Bill Thomas.png',
    '/showcase/mobile/Mobile Lord Romain.png',
    '/showcase/mobile/Mobile Matrix Romain.png',
    '/showcase/mobile/Mobile Star Wars Thomas.png',
    '/showcase/mobile/Mobile Star Wars Valentin.png',
    '/showcase/mobile/Mobile Zombie Samy.png',
  ];

  const handleGoogleSignIn = async () => {
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
      sign-in-page
      min-h-screen
      bg-[#e3e3e3]
      flex
      flex-col
      items-center
      justify-center
      py-[24px]
      px-[32px]
    ">
      {/* Content Container */}
      <div className="
        flex
        flex-col
        gap-[24px]
        items-center
        w-full
        max-w-[864px]
      ">
        {/* Logo Section */}
        <MorpheoLogo showRedDot={true} />

        {/* Text Frame - Tagline + Stats */}
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
            text-[16px]
            leading-[32px]
            text-black
          ">
            One selfie, infinite possibilities
          </p>

          {/* Stats */}
          <p className="
            font-['IBM_Plex_Mono']
            font-semibold
            text-[12px]
            leading-[24px]
            text-black
          ">
            ⚡ 1,576 photos created this week
            {/* TODO Phase 2: Replace with Supabase query: {weeklyPhotoCount} */}
          </p>
        </div>

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
