'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CinemaProjector({ images, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flickerOpacity, setFlickerOpacity] = useState(1.0);
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifactPosition, setArtifactPosition] = useState(50);

  // Auto-advance photos
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // 24fps flicker effect
  useEffect(() => {
    // 24fps = 41.67ms per frame
    const interval = setInterval(() => {
      setFlickerOpacity((prev) => (prev === 1.0 ? 0.97 : 1.0));
    }, 41.67);

    return () => clearInterval(interval);
  }, []);

  // Rare artifacts ("hair in gate")
  useEffect(() => {
    const checkArtifact = setInterval(() => {
      // 2% chance per frame (1 in 50)
      if (Math.random() < 0.02) {
        setShowArtifact(true);
        setArtifactPosition(Math.random() * 80 + 10); // 10-90%

        // Remove after 1-2 frames (41-83ms)
        setTimeout(() => setShowArtifact(false), Math.random() * 42 + 41);
      }
    }, 41.67); // Check every frame

    return () => clearInterval(checkArtifact);
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Cinema Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {/* Photo Container with xenon filter */}
        <div className="relative w-full h-full bg-black xenon-filter">
          <Image
            src={images[currentIndex]}
            alt={`Cinema frame ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-500"
            priority
          />
        </div>

        {/* Moving Grain Overlay */}
        <div className="moving-grain absolute inset-0 z-15 pointer-events-none" />

        {/* 24fps Flicker Layer */}
        <div
          className="absolute inset-0 z-20 bg-white pointer-events-none transition-opacity"
          style={{
            opacity: flickerOpacity === 1.0 ? 0 : 0.03,
            mixBlendMode: 'overlay',
            transitionDuration: '41.67ms',
            transitionTimingFunction: 'linear',
          }}
        />

        {/* Circular Aperture Vignette */}
        <div className="cinema-aperture absolute inset-0 z-25 pointer-events-none" />

        {/* Rare Artifact (Hair in Gate) */}
        {showArtifact && (
          <div
            className="hair-in-gate absolute top-0 h-full z-30 pointer-events-none"
            style={{
              left: `${artifactPosition}%`,
              width: '1px',
              background: 'rgba(255, 255, 255, 0.3)',
              filter: 'blur(0.5px)',
            }}
          />
        )}

        {/* Soft Focus Edges */}
        <div className="soft-focus absolute inset-0 z-35 pointer-events-none" />
      </div>

      {/* Children (GoogleButton) - Fixed position at center */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      <style jsx>{`
        .xenon-filter {
          filter: sepia(0.08) saturate(1.05) brightness(1.08) contrast(1.02);
        }

        .moving-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          background-size: 200% 200%;
          animation: grain-shift 0.5s steps(12) infinite;
          opacity: 0.08;
        }

        @keyframes grain-shift {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 50% 25%;
          }
          50% {
            background-position: 25% 50%;
          }
          75% {
            background-position: 75% 75%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        .cinema-aperture {
          background: radial-gradient(
            circle at center,
            transparent 0%,
            transparent 45%,
            rgba(0, 0, 0, 0.2) 65%,
            rgba(0, 0, 0, 0.5) 85%,
            rgba(0, 0, 0, 0.8) 100%
          );
        }

        .soft-focus {
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
