/**
 * Screen 1: Camera/Default Screen
 *
 * Main camera interface with:
 * - Camera preview
 * - Three action buttons (upload, capture, switch camera)
 * - Filter selector with navigation
 *
 * This screen integrates with the device camera and allows
 * photo capture or upload from files.
 */

'use client';

import { useRef, useState } from 'react';
import IconButton from '../ui/IconButton';
import FilterSelector from '../ui/FilterSelector';
import CaptureIcon from '../icons/CaptureIcon';
import UploadIcon from '../icons/UploadIcon';
import SwitchCameraIcon from '../icons/SwitchCameraIcon';

export default function CameraScreen({
  currentFilter,
  onFilterChange,
  onCapture,
  onUpload,
  videoRef,
  canvasRef,
  isMobile = true,
}) {
  const fileInputRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleSwitchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    // This would trigger re-initialization of camera with new facing mode
    // Implementation will be handled in the parent component/context
  };

  return (
    <div className="bg-background flex flex-col justify-between h-full w-full px-[12px] py-[8px]">
      {/* Camera Preview */}
      <div className="flex-1 bg-camera-bg min-h-0 relative rounded-[32px] shadow-camera-view overflow-hidden w-full">
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />

          {/* Canvas for capturing (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none shadow-camera-inner" />
      </div>

      {/* Controls Section */}
      <div className="flex flex-col items-center w-full">
        {/* Action Buttons Bar */}
        <div className="bg-background flex items-center justify-between overflow-hidden px-button-bar-x py-button-bar-y rounded-controls w-full">
          {/* Upload Button (Left) */}
          <IconButton
            variant="secondary"
            onClick={handleUploadClick}
            ariaLabel="Upload photo"
          >
            <UploadIcon className="w-full h-full" />
          </IconButton>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Capture Button (Center - Main) */}
          <IconButton
            variant="main"
            onClick={onCapture}
            ariaLabel="Capture photo"
          >
            <CaptureIcon className="w-full h-full" />
          </IconButton>

          {/* Camera Switch Button (Right - Mobile only) */}
          {isMobile && (
            <IconButton
              variant="secondary"
              onClick={handleSwitchCamera}
              ariaLabel="Switch camera"
            >
              <SwitchCameraIcon className="w-full h-full" />
            </IconButton>
          )}
        </div>

        {/* Filter Selector */}
        <FilterSelector
          currentFilter={currentFilter}
          onPrevious={() => onFilterChange?.('previous')}
          onNext={() => onFilterChange?.('next')}
        />

        {/* Bottom Spacer (for iPhone home indicator area) */}
        <div className="h-[40px] w-full bg-background" />
      </div>
    </div>
  );
}
