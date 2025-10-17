'use client'

import { useState, useRef, useEffect } from 'react'
import CameraScreen from '@/components/screens/CameraScreen'
import ResultScreen from '@/components/screens/ResultScreen'
import CameraAccessError from '@/components/screens/CameraAccessError'
import GenericError from '@/components/screens/GenericError'
import Loader from '@/components/ui/Loader'

// Available filters
const FILTERS = ['Creative', 'Corporate', 'Executive']

// Screen states
const SCREENS = {
  CAMERA: 'camera',
  LOADING: 'loading',
  RESULT: 'result',
  CAMERA_ERROR: 'camera_error',
  API_ERROR: 'api_error',
}

export default function Home() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)

  // Filter state
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

  // Image data
  const [capturedImage, setCapturedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  // Camera refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  // Initialize camera
  useEffect(() => {
    if (currentScreen === SCREENS.CAMERA) {
      initializeCamera()
    }

    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [currentScreen])

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setCurrentScreen(SCREENS.CAMERA_ERROR)
    }
  }

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
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas (flipped horizontally)
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95)
    setCapturedImage(imageData)

    // Generate image with API
    await generateImage(imageData)
  }

  // Upload photo from files
  const handleUpload = async (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target.result
      setCapturedImage(imageData)
      await generateImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  // Generate image via API
  const generateImage = async (imageData) => {
    // Show loading screen
    setCurrentScreen(SCREENS.LOADING)

    try {
      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          style: `${FILTERS[currentFilterIndex]} Professional`
        })
      })

      const data = await response.json()

      if (data.success && data.image) {
        setGeneratedImage(data.image)
        setCurrentScreen(SCREENS.RESULT)
      } else {
        console.error('Generation failed:', data.error)
        setCurrentScreen(SCREENS.API_ERROR)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setCurrentScreen(SCREENS.API_ERROR)
    }
  }

  // Retry camera permission
  const handleCameraRetry = () => {
    setCurrentScreen(SCREENS.CAMERA)
  }

  // Retry API call
  const handleApiRetry = async () => {
    if (capturedImage) {
      await generateImage(capturedImage)
    } else {
      setCurrentScreen(SCREENS.CAMERA)
    }
  }

  // Return to camera
  const handleNewPhoto = () => {
    setCapturedImage(null)
    setGeneratedImage(null)
    setCurrentScreen(SCREENS.CAMERA)
  }

  // Share callback - primarily handled by ResultScreen's Web Share API
  const handleShare = () => {
    // Could add analytics or success tracking here
    console.log('Share action completed')
  }

  // Download callback - actual download handled by ResultScreen
  const handleDownload = () => {
    // Could add analytics or success notification here
    console.log('Download completed')
  }

  // Render current screen
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[402px] mx-auto h-screen">
        {currentScreen === SCREENS.CAMERA && (
          <CameraScreen
            currentFilter={FILTERS[currentFilterIndex]}
            onFilterChange={handleFilterChange}
            onCapture={handleCapture}
            onUpload={handleUpload}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isMobile={isMobile}
          />
        )}

        {currentScreen === SCREENS.LOADING && (
          <Loader message="Generating your photo..." />
        )}

        {currentScreen === SCREENS.RESULT && (
          <ResultScreen
            imageUrl={generatedImage}
            onNewPhoto={handleNewPhoto}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        )}

        {currentScreen === SCREENS.CAMERA_ERROR && (
          <CameraAccessError onRetry={handleCameraRetry} />
        )}

        {currentScreen === SCREENS.API_ERROR && (
          <GenericError onRetry={handleApiRetry} />
        )}
      </div>
    </div>
  )
}
