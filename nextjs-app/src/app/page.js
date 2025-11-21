'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import CameraScreen from '@/components/screens/CameraScreen'
import ResultScreen from '@/components/screens/ResultScreen'
import CameraAccessError from '@/components/screens/CameraAccessError'
import GenericError from '@/components/screens/GenericError'
import FileFormatError from '@/components/screens/FileFormatError'
import FileSizeError from '@/components/screens/FileSizeError'
import Loader from '@/components/ui/Loader'
import { FILTERS } from '@/constants/filters'
import { validateFileFormat, validateFileSize } from '@/lib/fileValidation'
import { useCamera } from '@/hooks/useCamera'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { usePaymentPolling } from '@/hooks/usePaymentPolling'

// Screen states
const SCREENS = {
  CAMERA: 'camera',
  LOADING: 'loading',
  RESULT: 'result',
  CAMERA_ERROR: 'camera_error',
  API_ERROR: 'api_error',
  FILE_FORMAT_ERROR: 'file_format_error',
  FILE_SIZE_ERROR: 'file_size_error',
}

export default function Home() {
  const router = useRouter()
  const { user, loading } = useUser()
  const disableCameraForTests = process.env.NEXT_PUBLIC_E2E_DISABLE_CAMERA === 'true'

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)

  // Filter state
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

  // Image data
  const [capturedImage, setCapturedImage] = useState(null)

  // Hooks
  const {
    videoRef,
    canvasRef,
    cameraError,
    initializeCamera,
    captureImage
  } = useCamera(disableCameraForTests)

  const {
    generateImage,
    isGenerating,
    generatedImage,
    resetGeneration
  } = useImageGeneration()

  usePaymentPolling()

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in')
    }
  }, [loading, user, router])

  // Set dark background for camera page (Safari mobile fix)
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#242424';
    return () => {
      document.documentElement.style.backgroundColor = '#e3e3e3';
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    if (currentScreen === SCREENS.CAMERA) {
      initializeCamera()
    }
  }, [currentScreen, initializeCamera])

  // Handle camera errors from hook
  useEffect(() => {
    if (cameraError) {
      setCurrentScreen(SCREENS.CAMERA_ERROR)
    }
  }, [cameraError])

  // Filter navigation
  const handleFilterChange = (direction) => {
    if (direction === 'next') {
      setCurrentFilterIndex((prev) => (prev + 1) % FILTERS.length)
    } else {
      setCurrentFilterIndex((prev) => (prev - 1 + FILTERS.length) % FILTERS.length)
    }
  }

  // Capture photo
  const handleCapture = async () => {
    if (isGenerating) return

    const imageData = captureImage()

    if (!imageData) {
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    setCapturedImage(imageData)
    await handleGenerate(imageData)
  }

  // Upload photo from files
  const handleUpload = async (file) => {
    if (!file) return

    if (!validateFileFormat(file)) {
      setCurrentScreen(SCREENS.FILE_FORMAT_ERROR)
      return
    }

    if (!validateFileSize(file)) {
      setCurrentScreen(SCREENS.FILE_SIZE_ERROR)
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target.result
      if (!imageData || imageData === 'data:,' || imageData.length < 100) {
        setCurrentScreen(SCREENS.CAMERA_ERROR)
        return
      }

      setCapturedImage(imageData)
      await handleGenerate(imageData)
    }
    reader.onerror = () => setCurrentScreen(SCREENS.API_ERROR)
    reader.readAsDataURL(file)
  }

  const handleGenerate = async (imageData) => {
    setCurrentScreen(SCREENS.LOADING)

    const result = await generateImage(imageData, FILTERS[currentFilterIndex])

    if (result.success) {
      setCurrentScreen(SCREENS.RESULT)
    } else {
      if (result.error?.code === 'INSUFFICIENT_CREDITS') {
        setCurrentScreen(SCREENS.CAMERA)
      } else if (result.error?.code === 'UNAUTHORIZED') {
        // Already handled in hook (redirect)
      } else {
        setCurrentScreen(SCREENS.API_ERROR)
      }
    }
  }

  // Retry handlers
  const handleCameraRetry = () => setCurrentScreen(SCREENS.CAMERA)
  const handleApiRetry = async () => {
    if (capturedImage) {
      await handleGenerate(capturedImage)
    } else {
      setCurrentScreen(SCREENS.CAMERA)
    }
  }
  const handleFileFormatRetry = () => setCurrentScreen(SCREENS.CAMERA)
  const handleFileSizeRetry = () => setCurrentScreen(SCREENS.CAMERA)

  const handleNewPhoto = () => {
    setCapturedImage(null)
    resetGeneration()
    setCurrentScreen(SCREENS.CAMERA)
  }

  const handleShare = () => console.log('Share action completed')
  const handleDownload = () => console.log('Download completed')

  if (!loading && !user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[402px] md:max-w-none mx-auto h-screen relative">
        {(currentScreen === SCREENS.CAMERA || currentScreen === SCREENS.LOADING) && (
          <CameraScreen
            currentFilter={FILTERS[currentFilterIndex]}
            onFilterChange={handleFilterChange}
            onCapture={handleCapture}
            onUpload={handleUpload}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isGenerating={isGenerating}
          />
        )}

        {currentScreen === SCREENS.RESULT && (
          <ResultScreen
            imageUrl={generatedImage}
            onNewPhoto={handleNewPhoto}
            onShare={handleShare}
            onDownload={handleDownload}
            isMobile={isMobile}
          />
        )}

        {currentScreen === SCREENS.CAMERA_ERROR && <CameraAccessError onRetry={handleCameraRetry} />}
        {currentScreen === SCREENS.API_ERROR && <GenericError onRetry={handleApiRetry} />}
        {currentScreen === SCREENS.FILE_FORMAT_ERROR && <FileFormatError onRetry={handleFileFormatRetry} />}
        {currentScreen === SCREENS.FILE_SIZE_ERROR && <FileSizeError onRetry={handleFileSizeRetry} />}

        {currentScreen === SCREENS.LOADING && (
          <Loader filterName={FILTERS[currentFilterIndex]} imageUrl={capturedImage} />
        )}
      </div>
    </div>
  )
}
