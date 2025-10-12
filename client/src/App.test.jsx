import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

global.localStorage = localStorageMock

// Mock fetch
global.fetch = vi.fn()

// Mock getUserMedia
const mockGetUserMedia = vi.fn()
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
})

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()

    // Mock successful camera access
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }]
    }
    mockGetUserMedia.mockResolvedValue(mockStream)

    // Mock canvas for photo capture
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(),
      drawImage: vi.fn()
    }))
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockCapturedImage')
  })

  it('renders camera capture on initial load', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    expect(screen.getByText('Corporate')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
  })

  it('initializes with Creative Professional style selected', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const creativeButton = screen.getByText('Creative')
    expect(creativeButton).toHaveClass('bg-yellow-500')
  })

  it('changes selected style when style button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    const corporateButton = screen.getByText('Corporate')
    await user.click(corporateButton)

    expect(corporateButton).toHaveClass('bg-yellow-500')
  })

  it('saves captured image to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for camera to load
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    // Capture photo
    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'capturedImage',
      expect.any(String)
    )
  })

  it('displays Generate Headshot button after capture', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    await waitFor(() => {
      expect(screen.getByText('Generate Headshot')).toBeInTheDocument()
    })
  })

  it('calls API when Generate Headshot button is clicked', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        image: 'data:image/png;base64,mockGeneratedImage',
        style: 'Creative Professional'
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    await waitFor(() => {
      expect(screen.getByText('Generate Headshot')).toBeInTheDocument()
    })

    const generateButton = screen.getByText('Generate Headshot')
    await user.click(generateButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/generate-headshot',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  it('shows loading spinner during API call', async () => {
    const user = userEvent.setup()

    // Mock delayed API response
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({
          success: true,
          image: 'data:image/png;base64,mockGeneratedImage'
        })
      }), 100))
    )

    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    const generateButton = await screen.findByText('Generate Headshot')
    await user.click(generateButton)

    expect(screen.getByText('Generating your headshot...')).toBeInTheDocument()
  })

  it('changes button text to Generate Again after successful generation', async () => {
    const user = userEvent.setup()

    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        image: 'data:image/png;base64,mockGeneratedImage'
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    const generateButton = await screen.findByText('Generate Headshot')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Generate Again')).toBeInTheDocument()
    })
  })

  it('clears images when Retake Photo is clicked', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    const retakeButton = await screen.findByText('Retake Photo')
    await user.click(retakeButton)

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('capturedImage')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('generatedImage')
  })
})
