'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import HeaderSection from './HeaderSection';

export default function LegalLayout({ children }) {
    // Ensure gray background for Safari mobile (same as SignInLayout)
    useEffect(() => {
        const originalHtmlBg = document.documentElement.style.background;
        const originalBodyBg = document.body.style.backgroundColor;

        document.documentElement.style.background = '#e3e3e3';
        document.body.style.backgroundColor = '#e3e3e3';

        // Dynamic Theme Color Logic for Safari Top Overscroll
        const updateThemeColor = () => {
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (!themeColorMeta) return;

            const newColor = window.scrollY < 20 ? '#ffcc53' : '#e3e3e3';

            if (themeColorMeta.getAttribute('content') !== newColor) {
                themeColorMeta.setAttribute('content', newColor);
            }
        };

        updateThemeColor();
        window.addEventListener('scroll', updateThemeColor);

        return () => {
            document.documentElement.style.background = originalHtmlBg;
            document.body.style.backgroundColor = originalBodyBg;
            window.removeEventListener('scroll', updateThemeColor);

            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                themeColorMeta.setAttribute('content', '#242424');
            }
        };
    }, []);

    return (
        <main className="
      min-h-screen
      bg-[#e3e3e3]
      flex
      flex-col
      items-center
      relative
      py-[8px]
      md:py-[12px]
    ">
            {/* Fixed Gradient Background */}
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
                style={{ zIndex: 0 }}
            />

            {/* Content Container */}
            <div className="
        flex
        flex-col
        items-center
        w-full
        max-w-[1400px]
        relative
        z-10
        px-[24px]
        md:px-[32px]
      ">
                {/* Header - Reusing HeaderSection in simple mode */}
                <div className="flex justify-center w-full">
                    <Link href="/sign-in" className="no-underline w-full flex justify-center">
                        <HeaderSection variant="simple" />
                    </Link>
                </div>

                {/* Legal Content Card - Constrained Width */}
                <div className="
          w-full
          max-w-[800px]
          bg-white/50
          backdrop-blur-sm
          rounded-[24px]
          p-[24px]
          md:p-[48px]
          shadow-sm
          mb-[48px]
        ">
                    {children}
                </div>

                <Footer />
            </div>
        </main>
    );
}
