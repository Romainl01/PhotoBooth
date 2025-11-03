/**
 * CameraPermissionModal Component
 *
 * Modal dialog that requests camera access on user interaction
 * Improves permission persistence by requesting on button click instead of automatic page load
 */

'use client';

import { useEffect } from 'react';
import IconButton from './IconButton';
import CloseIcon from '../icons/CloseIcon';
import Button from './Button';

export default function CameraPermissionModal({ isOpen, onClose, onEnableCamera }) {
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
          ariaLabel="Close camera permission modal"
        >
          <CloseIcon className="w-full h-full" />
        </IconButton>

        {/* Content */}
        <div className="px-[16px]">
          <p className="font-mono font-medium text-body text-text-primary text-center">
            Morpheo needs access to your camera.
          </p>
        </div>

        {/* Action Button */}
        <Button onClick={onEnableCamera}>
          Enable camera access
        </Button>
      </div>
    </div>
  );
}
