export default function ImageComparison({ originalImage, generatedImage, style, onRetake }) {
  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `headshot-${style.toLowerCase().replace(' ', '-')}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Professional Headshot</h2>
        <p className="text-gray-400">Style: {style}</p>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-300">Original</h3>
          <div className="bg-zinc-900 rounded-xl overflow-hidden">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-300">Generated ({style})</h3>
          <div className="bg-zinc-900 rounded-xl overflow-hidden ring-2 ring-yellow-500">
            <img
              src={generatedImage}
              alt="Generated headshot"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
        >
          Take New Photo
        </button>
        <button
          onClick={downloadImage}
          className="flex-1 px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Headshot
        </button>
      </div>
    </div>
  )
}
