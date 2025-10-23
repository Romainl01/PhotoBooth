/**
 * InfoModal Component
 *
 * Information modal dialog that displays on desktop only
 * Shows info about the app creator with contact button
 */

'use client';

import { useEffect } from 'react';
import IconButton from './IconButton';
import CloseIcon from '../icons/CloseIcon';
import Button from './Button';

export default function InfoModal({ isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleContactClick = () => {
    window.open('https://www.linkedin.com/in/romain-lagrange1/', '_blank', 'noopener,noreferrer');
  };

  const handleSupportClick = () => {
    window.open('https://buymeacoffee.com/morpheo', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#242424] rounded-[24px] p-[16px] w-[306px] md:w-[90vw] md:max-w-[400px] flex flex-col gap-[16px] md:gap-[24px]">
        {/* Close Button */}
        <IconButton
          variant="nav"
          onClick={onClose}
          ariaLabel="Close info modal"
        >
          <CloseIcon className="w-full h-full" />
        </IconButton>

        {/* Content */}
        <div className="px-[16px]">
          <p className="font-mono font-medium text-body text-text-primary text-center">
            Made with 🫶 by Romain Lagrange
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[16px]">
          {/* Contact Button */}
          <Button onClick={handleContactClick}>
            Contact me
          </Button>

          {/* Support Button */}
          <Button onClick={handleSupportClick}>
            Support this project <span className="font-sans ml-2">☕</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
