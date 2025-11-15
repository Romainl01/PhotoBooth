'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import CameraScreen from '@/components/screens/CameraScreen'
import ResultScreen from '@/components/screens/ResultScreen'
import CameraAccessError from '@/components/screens/CameraAccessError'
import GenericError from '@/components/screens/GenericError'
import FileFormatError from '@/components/screens/FileFormatError'
import FileSizeError from '@/components/screens/FileSizeError'
import Loader from '@/components/ui/Loader'
import { FILTERS } from '@/constants/filters'
import { validateFileFormat, validateFileSize, formatFileSize } from '@/lib/fileValidation'

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
  // Phase 2A: User context for credit management + auth guard
  const { user, loading, refreshCredits, updateCredits } = useUser()
  const disableCameraForTests = process.env.NEXT_PUBLIC_E2E_DISABLE_CAMERA === 'true'

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)

  // Filter state
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

  // Image data
  const [capturedImage, setCapturedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  // Generation lock (prevent race condition from multiple rapid clicks)
  const [isGenerating, setIsGenerating] = useState(false)

  // Camera refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

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

  // Phase 2B: Handle Stripe payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')

    if (paymentStatus === 'success') {
      console.log('[Payment] Payment successful! Refreshing credits...')

      // Poll for credits update (webhook might take 1-3 seconds)
      let pollCount = 0
      const maxPolls = 5 // Poll up to 5 times

      const pollInterval = setInterval(async () => {
        console.log(`[Payment] Polling credits (attempt ${pollCount + 1}/${maxPolls})`)
        await refreshCredits()
        pollCount++

        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          console.log('[Payment] Stopped polling after', pollCount, 'attempts')
        }
      }, 2000) // Poll every 2 seconds

      // Clean up URL (remove query params) after a short delay
      setTimeout(() => {
        window.history.replaceState({}, '', '/')
      }, 3000)

      // Cleanup interval on unmount
      return () => clearInterval(pollInterval)
    } else if (paymentStatus === 'cancelled') {
      console.log('[Payment] Payment cancelled by user')
      // Clean up URL
      window.history.replaceState({}, '', '/')
    }
  }, [refreshCredits])

  // Initialize camera
  useEffect(() => {
    if (disableCameraForTests) {
      return
    }

    if (currentScreen === SCREENS.CAMERA) {
      initializeCamera()
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [currentScreen, disableCameraForTests])

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
    // Guard: Prevent multiple simultaneous generations (race condition)
    if (isGenerating) {
      console.log('[Capture] Already generating, ignoring click')
      return
    }

    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Validate video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready - dimensions are 0')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Validate canvas dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas initialization failed - dimensions are 0')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    // Draw video frame to canvas (flipped horizontally)
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95)

    // Validate image data is not empty
    if (!imageData || imageData === 'data:,' || imageData.length < 100) {
      console.error('Failed to capture image - empty or invalid data')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    setCapturedImage(imageData)

    // Generate image with API
    await generateImage(imageData, currentFilterIndex)
  }

  // Upload photo from files
  const handleUpload = async (file) => {
    // Guard: No file selected
    if (!file) {
      console.error('No file selected')
      return
    }

    // Validation Step 1: File Format
    if (!validateFileFormat(file)) {
      console.error('Invalid file format:', file.type)
      setCurrentScreen(SCREENS.FILE_FORMAT_ERROR)
      return
    }

    // Validation Step 2: File Size
    if (!validateFileSize(file)) {
      console.error('File too large:', formatFileSize(file.size))
      setCurrentScreen(SCREENS.FILE_SIZE_ERROR)
      return
    }

    // Proceed with existing flow (validation passed)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const imageData = e.target.result

      // Validate FileReader output
      if (!imageData || imageData === 'data:,' || imageData.length < 100) {
        console.error('Failed to read image file - empty or invalid data')
        setCurrentScreen(SCREENS.CAMERA_ERROR)
        return
      }

      setCapturedImage(imageData)
      await generateImage(imageData, currentFilterIndex)
    }

    reader.onerror = () => {
      console.error('FileReader error')
      setCurrentScreen(SCREENS.API_ERROR)
    }

    reader.readAsDataURL(file)
  }

  // Generate image via API
  const generateImage = async (imageData, filterIndex) => {
    // Validate inputs before making API call
    if (!imageData || imageData === 'data:,' || imageData.length < 100) {
      console.error('Cannot generate - invalid or empty image data')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    if (filterIndex < 0 || filterIndex >= FILTERS.length) {
      console.error('Invalid filter index:', filterIndex)
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    // Lock generation to prevent race condition
    setIsGenerating(true)

    // Show loading screen immediately
    setCurrentScreen(SCREENS.LOADING)

    const style = FILTERS[filterIndex]
    console.log('Generating with style:', style, 'Image data length:', imageData.length)

    try {
      // Refresh session before API call (prevent session expiry mid-generation)
      const supabase = createClient()

      // Add timeout to prevent hanging indefinitely (10 second timeout)
      const refreshPromise = supabase.auth.refreshSession()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session refresh timeout after 10s')), 10000)
      )

      try {
        const { data: { session }, error: refreshError } = await Promise.race([
          refreshPromise,
          timeoutPromise
        ])

        if (refreshError) {
          console.warn('[Session] Failed to refresh session:', refreshError)
          console.log('[Session] Proceeding with API call anyway...')
        } else {
          console.log('[Session] Token refreshed successfully')
        }
      } catch (timeoutError) {
        // Session refresh timed out - proceed anyway and let API call handle auth
        console.warn('[Session] Refresh timed out, proceeding with API call:', timeoutError.message)
      }
      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          style: style
        })
      })

      const data = await response.json()

      // Phase 2A: Handle 402 Payment Required (insufficient credits)
      if (response.status === 402) {
        console.log('[Generate] Insufficient credits - returning to camera with paywall')
        setCurrentScreen(SCREENS.CAMERA)
        // Paywall will be shown by CameraScreen component
        return
      }

      // Phase 2A: Handle 401 Unauthorized (should not happen with middleware, but safe to check)
      if (response.status === 401) {
        console.error('[Generate] Unauthorized - redirecting to sign-in')
        window.location.href = '/sign-in'
        return
      }

      if (data.success && data.image) {
        setGeneratedImage(data.image)
        setCurrentScreen(SCREENS.RESULT)

        // Phase 2A: Update credits from API response (synchronous, guaranteed consistency)
        // API returns the new credit count after deduction, eliminating race conditions
        if (typeof data.credits === 'number') {
          console.log('[Generate] Success - updating credits to:', data.credits)
          updateCredits(data.credits)
        } else {
          // Fallback: API didn't return credits (backward compatibility or error)
          console.warn('[Generate] API did not return credits, falling back to async refresh')
          refreshCredits().catch(err => {
            console.warn('[Generate] Credit refresh failed (non-critical):', err)
          })
        }
      } else {
        console.error('Generation failed:', data.error)
        setCurrentScreen(SCREENS.API_ERROR)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setCurrentScreen(SCREENS.API_ERROR)
    } finally {
      // Always unlock generation, even if there was an error
      setIsGenerating(false)
    }
  }

  // Retry camera permission
  const handleCameraRetry = () => {
    setCurrentScreen(SCREENS.CAMERA)
  }

  // Retry API call
  const handleApiRetry = async () => {
    if (capturedImage) {
      await generateImage(capturedImage, currentFilterIndex)
    } else {
      setCurrentScreen(SCREENS.CAMERA)
    }
  }

  // Retry file upload after format error
  const handleFileFormatRetry = () => {
    setCurrentScreen(SCREENS.CAMERA)
  }

  // Retry file upload after size error
  const handleFileSizeRetry = () => {
    setCurrentScreen(SCREENS.CAMERA)
  }

  // Return to camera
  const handleNewPhoto = () => {
    setCapturedImage(null)
    setGeneratedImage(null)
    setCurrentScreen(SCREENS.CAMERA)

    // Safety fallback: Refresh credits when returning to camera
    // This ensures UI consistency even if API didn't return credits or user session changed
    // Non-blocking to prevent UI lag
    refreshCredits().catch(err => {
      console.warn('[NewPhoto] Credit refresh failed (non-critical):', err)
    })
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
  if (!loading && !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[402px] md:max-w-none mx-auto h-screen relative">
        {/* Show camera screen when loading (it stays visible under overlay) */}
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

        {currentScreen === SCREENS.CAMERA_ERROR && (
          <CameraAccessError onRetry={handleCameraRetry} />
        )}

        {currentScreen === SCREENS.API_ERROR && (
          <GenericError onRetry={handleApiRetry} />
        )}

        {currentScreen === SCREENS.FILE_FORMAT_ERROR && (
          <FileFormatError onRetry={handleFileFormatRetry} />
        )}

        {currentScreen === SCREENS.FILE_SIZE_ERROR && (
          <FileSizeError onRetry={handleFileSizeRetry} />
        )}

        {/* Loading overlay - appears over camera screen with captured photo */}
        {currentScreen === SCREENS.LOADING && (
          <Loader filterName={FILTERS[currentFilterIndex]} imageUrl={capturedImage} />
        )}
      </div>
    </div>
  )
}
