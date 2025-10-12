import { useState } from 'react'
import CameraCapture from './components/CameraCapture'

function App() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('Creative Professional')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCamera, setShowCamera] = useState(true)

  const handleCapture = (imageData) => {
    setCapturedImage(imageData)
    setShowCamera(false)
    // Save to localStorage
    localStorage.setItem('capturedImage', imageData)
  }

  const handleGenerate = async () => {
    if (!capturedImage) return

    setIsGenerating(true)
    // Mock generation for Milestone 1
    setTimeout(() => {
      setGeneratedImage(capturedImage) // Use captured image as placeholder
      localStorage.setItem('generatedImage', capturedImage)
      setIsGenerating(false)
    }, 1500)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setGeneratedImage(null)
    setShowCamera(true)
    localStorage.removeItem('capturedImage')
    localStorage.removeItem('generatedImage')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-screen overflow-hidden">
        {/* Camera/Image Display */}
        {showCamera ? (
          <CameraCapture
            onCapture={handleCapture}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
        ) : (
          <>
            {/* Captured/Generated Image Display */}
            <img
              src={generatedImage || capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay with controls */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
              {/* Style selector */}
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => setSelectedStyle('Corporate Classic')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Corporate Classic'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Corporate
                </button>
                <button
                  onClick={() => setSelectedStyle('Creative Professional')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Creative Professional'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Creative
                </button>
                <button
                  onClick={() => setSelectedStyle('Executive Portrait')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === 'Executive Portrait'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white'
                  }`}
                >
                  Executive
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 max-w-2xl mx-auto">
                <button
                  onClick={handleRetake}
                  className="flex-1 px-6 py-4 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Headshot'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
