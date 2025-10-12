import { useRef, useState, useEffect } from 'react'

export default function CameraCapture({ onCapture, selectedStyle, onStyleChange }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [facingMode, setFacingMode] = useState('user') // 'user' for front camera, 'environment' for back

  useEffect(() => {
    startCamera()

    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
      setIsLoading(false)
    } catch (err) {
      console.error('Camera error:', err)
      setError('Could not access camera. Please check permissions.')
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas (flipped horizontally to match preview)
      const context = canvas.getContext('2d')
      context.scale(-1, 1)
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.9)

      // Stop camera after capture
      stopCamera()

      // Send image to parent component
      onCapture(imageData)
    }
  }

  const retryCamera = () => {
    startCamera()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-zinc-900 rounded-2xl p-8">
        <div className="text-6xl mb-6">📷</div>
        <h2 className="text-2xl font-bold mb-2">Camera Error</h2>
        <p className="text-gray-400 mb-6 text-center">{error}</p>
        <button
          onClick={retryCamera}
          className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Starting camera...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Camera controls overlay */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex items-center justify-center mb-6">
          {/* Capture button */}
          <button
            onClick={capturePhoto}
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-105 transition-transform border-4 border-white"
            aria-label="Capture photo"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Style selector at bottom */}
        <div className="flex gap-3 justify-center px-4">
          <button
            onClick={() => onStyleChange('Corporate Classic')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Corporate Classic'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Corporate
          </button>
          <button
            onClick={() => onStyleChange('Creative Professional')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Creative Professional'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Creative
          </button>
          <button
            onClick={() => onStyleChange('Executive Portrait')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === 'Executive Portrait'
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
            }`}
          >
            Executive
          </button>
        </div>
      </div>
    </div>
  )
}
