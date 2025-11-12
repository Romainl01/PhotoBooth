'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function VHSPlayback({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [warpActive, setWarpActive] = useState(false);

  // Dynamic timestamp (REC HH:MM:SS AM/PM)
  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

      setTimestamp(`REC ${hours}:${minutes}:${seconds} ${ampm}`);
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-advance with pause glitch
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      // Phase 1: Show pause glitch
      setIsPaused(true);

      // Phase 2: Swap photo after 200ms
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 200);

      // Phase 3: Resume playback after 400ms
      setTimeout(() => {
        setIsPaused(false);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // Horizontal warping (rare, 1% chance per second)
  useEffect(() => {
    const checkWarp = setInterval(() => {
      if (Math.random() < 0.01) {
        setWarpActive(true);
        setTimeout(() => setWarpActive(false), 500);
      }
    }, 1000);

    return () => clearInterval(checkWarp);
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* VHS Container */}
      <div className="relative w-full h-full rounded-lg" style={{ overflow: 'hidden' }}>
        {/* Photo Container with color bleeding */}
        <div
          className={`relative w-full h-full bg-black color-bleed ${
            warpActive ? 'warp-active' : ''
          }`}
        >
          <Image
            src={images[currentIndex]}
            alt={`VHS tape ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        </div>

        {/* Tracking Lines */}
        <div className="tracking-lines absolute inset-0 z-20 pointer-events-none" />

        {/* VHS Noise */}
        <div className="vhs-noise absolute inset-0 z-15 pointer-events-none" />

        {/* Pause Glitch */}
        <div
          className={`pause-glitch absolute inset-0 z-30 pointer-events-none transition-opacity duration-100 ${
            isPaused ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dynamic Timestamp Overlay */}
        <div
          className="absolute top-4 right-4 z-35 font-mono text-white text-sm bg-black/50 px-2 py-1 rounded pointer-events-none"
          style={{ fontFamily: 'monospace' }}
        >
          {timestamp}
        </div>
      </div>

      <style jsx>{`
        .color-bleed {
          filter: drop-shadow(2px 0 0 rgba(255, 0, 0, 0.3))
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.3));
        }

        .tracking-lines {
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(255, 255, 255, 0.02) 2px,
            transparent 4px,
            rgba(0, 0, 0, 0.05) 5px,
            transparent 6px
          );
          animation: tracking-drift 4s ease-in-out infinite;
        }

        @keyframes tracking-drift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .vhs-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
          background-size: 200% 200%;
          opacity: 0.1;
          animation: vhs-noise-shift 0.3s steps(6) infinite;
        }

        @keyframes vhs-noise-shift {
          0% {
            background-position: 0% 0%;
          }
          33% {
            background-position: 50% 50%;
          }
          66% {
            background-position: 25% 75%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        .pause-glitch {
          background: repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.1) 0px,
              transparent 2px,
              transparent 4px
            ),
            linear-gradient(
              180deg,
              transparent 48%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 52%
            );
        }

        .warp-active {
          animation: horizontal-warp 0.5s ease-in-out;
        }

        @keyframes horizontal-warp {
          0%,
          100% {
            transform: translateX(0) scaleX(1);
          }
          25% {
            transform: translateX(5px) scaleX(0.98);
          }
          50% {
            transform: translateX(-3px) scaleX(1.02);
          }
          75% {
            transform: translateX(2px) scaleX(0.99);
          }
        }
      `}</style>
    </div>
  );
}
