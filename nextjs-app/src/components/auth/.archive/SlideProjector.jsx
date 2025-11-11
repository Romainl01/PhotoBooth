'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SlideProjector({ images, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBlackScreen, setShowBlackScreen] = useState(false);

  // Dust particle configuration
  const dustParticles = [
    { x: 20, y: 30, size: 2, duration: 8 },
    { x: 60, y: 50, size: 3, duration: 10 },
    { x: 80, y: 20, size: 1.5, duration: 12 },
    { x: 35, y: 70, size: 2.5, duration: 9 },
    { x: 75, y: 45, size: 1.8, duration: 11 },
  ];

  // Auto-advance with black screen transition
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      // Phase 1: Fade to black
      setShowBlackScreen(true);

      // Phase 2: Swap photo (after 100ms)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 100);

      // Phase 3: Fade from black (after 200ms)
      setTimeout(() => {
        setShowBlackScreen(false);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Slide Projector Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {/* Photo Container with warm tungsten filter */}
        <div className="relative w-full h-full bg-black tungsten-filter">
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Black Screen Transition */}
        <div
          className={`
            absolute inset-0 bg-black z-50 pointer-events-none
            transition-opacity duration-200 ease-in-out
            ${showBlackScreen ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Circular Vignette (projector light cone) */}
        <div className="projector-vignette absolute inset-0 z-20 pointer-events-none" />

        {/* Dust Particles */}
        {dustParticles.map((dust, i) => (
          <div
            key={i}
            className="dust-particle absolute rounded-full pointer-events-none z-30"
            style={{
              left: `${dust.x}%`,
              top: `${dust.y}%`,
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              background: 'rgba(255, 255, 255, 0.4)',
              filter: 'blur(1px)',
              animation: `float${i} ${dust.duration}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Soft Edges */}
        <div className="soft-edges absolute inset-0 z-15 pointer-events-none" />
      </div>

      {/* Children (GoogleButton) - Fixed position at center */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      <style jsx>{`
        .tungsten-filter {
          filter: sepia(0.15) saturate(1.1) brightness(1.05) hue-rotate(-5deg);
        }

        .projector-vignette {
          background: radial-gradient(
            ellipse 70% 60% at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.7) 100%
          );
        }

        .soft-edges {
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.1),
            inset 0 0 80px rgba(0, 0, 0, 0.05);
        }

        /* Individual dust particle animations with unique patterns */
        @keyframes float0 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          25% {
            transform: translate(10px, -15px);
            opacity: 0.5;
          }
          50% {
            transform: translate(-5px, -30px);
            opacity: 0.3;
          }
          75% {
            transform: translate(15px, -20px);
            opacity: 0.6;
          }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          25% {
            transform: translate(-8px, -12px);
            opacity: 0.6;
          }
          50% {
            transform: translate(12px, -25px);
            opacity: 0.4;
          }
          75% {
            transform: translate(-6px, -18px);
            opacity: 0.5;
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.25;
          }
          25% {
            transform: translate(8px, -10px);
            opacity: 0.5;
          }
          50% {
            transform: translate(-10px, -20px);
            opacity: 0.35;
          }
          75% {
            transform: translate(5px, -15px);
            opacity: 0.6;
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          25% {
            transform: translate(-12px, -18px);
            opacity: 0.55;
          }
          50% {
            transform: translate(8px, -28px);
            opacity: 0.3;
          }
          75% {
            transform: translate(-10px, -22px);
            opacity: 0.5;
          }
        }

        @keyframes float4 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          25% {
            transform: translate(15px, -20px);
            opacity: 0.6;
          }
          50% {
            transform: translate(-8px, -35px);
            opacity: 0.4;
          }
          75% {
            transform: translate(12px, -25px);
            opacity: 0.55;
          }
        }
      `}</style>
    </div>
  );
}
