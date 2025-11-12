'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PolaroidStack({ images, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [developmentProgress, setDevelopmentProgress] = useState(100);
  const [stackHistory, setStackHistory] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Random rotation helper
  const getRandomRotation = () => (Math.random() - 0.5) * 6; // -3 to +3 degrees

  // Initialize with first photo
  useEffect(() => {
    setRotation(getRandomRotation());
  }, []);

  // Auto-advance with development effect
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      const newRotation = getRandomRotation();

      // Phase 1: Drop in animation
      setIsDropping(true);
      setIsDeveloping(true);
      setDevelopmentProgress(0);
      setRotation(newRotation);

      // Phase 2: Complete drop (600ms)
      setTimeout(() => {
        setIsDropping(false);
        setIsShaking(true);
      }, 600);

      // Phase 3: Stop shaking (1000ms)
      setTimeout(() => {
        setIsShaking(false);
      }, 1000);

      // Update stack history
      setStackHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            id: Date.now(),
            image: images[currentIndex],
            rotation: rotation,
          },
        ].slice(-3); // Keep last 3 photos
        return newHistory;
      });

      // Change photo
      setCurrentIndex(nextIndex);

      // Phase 4: Development animation (3 seconds)
      const developmentDuration = 3000;
      const steps = 60; // 20fps
      const stepTime = developmentDuration / steps;
      let currentStep = 0;

      const developInterval = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps) * 100;
        setDevelopmentProgress(progress);

        if (progress >= 100) {
          clearInterval(developInterval);
          setIsDeveloping(false);
        }
      }, stepTime);
    }, 6000); // 6 seconds total (3s development + 3s viewing)

    return () => clearInterval(interval);
  }, [images, currentIndex, rotation]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-transparent overflow-hidden">
      {/* Stack Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Previous photos (stack underneath) */}
        {stackHistory.map((photo, idx) => (
          <div
            key={photo.id}
            className="polaroid-frame absolute bg-white shadow-lg pointer-events-none"
            style={{
              zIndex: 10 + idx,
              transform: `
                translate(${idx * 3}px, ${idx * 4}px)
                rotate(${photo.rotation}deg)
                scale(${0.92 - idx * 0.03})
              `,
              opacity: 0.7 - idx * 0.2,
              padding: '12px 12px 36px 12px',
              width: '280px',
              height: '320px',
            }}
          >
            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
              <Image
                src={photo.image}
                alt="Previous polaroid"
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}

        {/* Current photo (on top) */}
        <div
          className={`
            polaroid-frame absolute bg-white shadow-xl pointer-events-none
            ${isDropping ? 'polaroid-dropping' : ''}
            ${isShaking ? 'polaroid-shaking' : ''}
          `}
          style={{
            zIndex: 20,
            transform: `rotate(${rotation}deg)`,
            padding: '12px 12px 36px 12px',
            width: '280px',
            height: '320px',
            '--final-rotation': `${rotation}deg`,
          }}
        >
          <div className="relative w-full h-full bg-gray-200 overflow-hidden">
            <Image
              src={images[currentIndex]}
              alt={`Polaroid ${currentIndex + 1}`}
              fill
              className="object-cover developing-photo"
              style={{
                '--progress': developmentProgress,
                filter: `
                  brightness(${2 - developmentProgress * 0.01})
                  contrast(${0.3 + developmentProgress * 0.007})
                  saturate(${0.2 + developmentProgress * 0.008})
                `,
                transition: 'filter 50ms linear',
              }}
              priority
            />
          </div>

          {/* White flash overlay (early development stage) */}
          {isDeveloping && developmentProgress < 30 && (
            <div
              className="absolute bg-white pointer-events-none"
              style={{
                opacity: 1 - developmentProgress / 30,
                top: '12px',
                left: '12px',
                right: '12px',
                bottom: '36px',
              }}
            />
          )}
        </div>
      </div>

      {/* Children (GoogleButton) - Fixed position at center */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      <style jsx>{`
        .polaroid-frame {
          border-radius: 2px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .polaroid-dropping {
          animation: polaroid-drop 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes polaroid-drop {
          0% {
            transform: translateY(-150%) rotate(0deg);
            opacity: 0;
          }
          40% {
            transform: translateY(0%) rotate(var(--final-rotation));
            opacity: 1;
          }
          55% {
            transform: translateY(8px) rotate(var(--final-rotation));
          }
          70% {
            transform: translateY(-4px) rotate(var(--final-rotation));
          }
          85% {
            transform: translateY(2px) rotate(var(--final-rotation));
          }
          100% {
            transform: translateY(0) rotate(var(--final-rotation));
          }
        }

        .polaroid-shaking {
          animation: photo-shake 400ms ease-in-out;
        }

        @keyframes photo-shake {
          0%,
          100% {
            transform: rotate(var(--final-rotation)) translateX(0);
          }
          25% {
            transform: rotate(var(--final-rotation)) translateX(-2px);
          }
          50% {
            transform: rotate(var(--final-rotation)) translateX(2px);
          }
          75% {
            transform: rotate(var(--final-rotation)) translateX(-1px);
          }
        }
      `}</style>
    </div>
  );
}
