'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function CRTShowcase({ images, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [degaussActive, setDegaussActive] = useState(true);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Static effect Canvas animation
  useEffect(() => {
    if (!showStatic || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    const animate = () => {
      // Generate random noise
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 255;
        imageData.data[i] = noise;     // R
        imageData.data[i + 1] = noise;   // G
        imageData.data[i + 2] = noise;   // B
        imageData.data[i + 3] = 255;     // A
      }
      ctx.putImageData(imageData, 0, 0);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showStatic]);

  // Auto-advance photos with static burst transition
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      // Phase 1: Show static
      setShowStatic(true);

      // Phase 2: Change photo during static (after 50ms)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 50);

      // Phase 3: Hide static (after 150ms total)
      setTimeout(() => {
        setShowStatic(false);
      }, 150);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // Degauss effect (once on mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDegaussActive(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* CRT Screen Container with curvature */}
      <div
        className={`
          relative w-full h-full overflow-hidden
          rounded-[32px]
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.3)]
          ${degaussActive ? 'animate-degauss' : ''}
        `}
        style={{
          transform: 'perspective(1000px) rotateX(0.5deg)',
        }}
      >
        {/* Photo Container with chromatic aberration */}
        <div className="relative w-full h-full bg-black chromatic-aberration">
          <Image
            src={images[currentIndex]}
            alt={`Showcase image ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        </div>

        {/* Static Overlay (Canvas) */}
        {showStatic && (
          <canvas
            ref={canvasRef}
            width={800}
            height={456}
            className="absolute inset-0 w-full h-full z-50 pointer-events-none opacity-80"
            style={{
              animation: 'fadeIn 50ms ease-in',
            }}
          />
        )}

        {/* Scan Lines */}
        <div className="scan-lines absolute inset-0 z-20 pointer-events-none" />

        {/* Bloom Effect */}
        <div className="bloom-effect absolute inset-0 z-25 pointer-events-none" />
      </div>

      {/* Children (GoogleButton) - Fixed position at center */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      <style jsx>{`
        .scan-lines {
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(0, 0, 0, 0.05) 1px,
            transparent 2px,
            transparent 3px
          );
          animation: scan 8s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .chromatic-aberration {
          filter: drop-shadow(1px 0 0 rgba(255, 0, 0, 0.5))
                  drop-shadow(-1px 0 0 rgba(0, 255, 255, 0.5));
        }

        .bloom-effect {
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 60%
          );
          filter: blur(20px);
          mix-blend-mode: screen;
        }

        .animate-degauss {
          animation: degauss 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        @keyframes degauss {
          0% {
            transform: perspective(1000px) rotateX(0.5deg) scale(1) translateX(0);
            filter: hue-rotate(0deg);
          }
          25% {
            transform: perspective(1000px) rotateX(0.5deg) scale(1.01) translateX(2px);
            filter: hue-rotate(5deg);
          }
          50% {
            transform: perspective(1000px) rotateX(0.5deg) scale(0.99) translateX(-2px);
            filter: hue-rotate(-5deg);
          }
          75% {
            transform: perspective(1000px) rotateX(0.5deg) scale(1.005) translateX(1px);
            filter: hue-rotate(2deg);
          }
          100% {
            transform: perspective(1000px) rotateX(0.5deg) scale(1) translateX(0);
            filter: hue-rotate(0deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
