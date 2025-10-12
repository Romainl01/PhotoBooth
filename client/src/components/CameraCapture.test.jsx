import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CameraCapture from './CameraCapture'

// Mock getUserMedia
const mockGetUserMedia = vi.fn()
const mockVideoRef = {
  current: {
    videoWidth: 1280,
    videoHeight: 720,
    srcObject: null
  }
}

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
})

describe('CameraCapture Component', () => {
  const mockOnCapture = vi.fn()
  const mockOnStyleChange = vi.fn()
  const mockStream = {
    getTracks: () => [{ stop: vi.fn() }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserMedia.mockResolvedValue(mockStream)
  })

  it('renders camera interface', async () => {
    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    expect(screen.getByLabelText('Capture photo')).toBeInTheDocument()
  })

  it('calls getUserMedia on mount', async () => {
    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
    })
  })

  it('displays loading state while camera initializes', async () => {
    // Delay the camera response to catch loading state
    mockGetUserMedia.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve(mockStream), 100))
    )

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    expect(screen.getByText('Starting camera...')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })
  })

  it('displays error when camera access fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Camera Error')).toBeInTheDocument()
      expect(screen.getByText(/Could not access camera/)).toBeInTheDocument()
    })
  })

  it('allows retrying camera after error', async () => {
    const user = userEvent.setup()
    mockGetUserMedia
      .mockRejectedValueOnce(new Error('Permission denied'))
      .mockResolvedValueOnce(mockStream)

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2)
    })
  })

  it('renders all style buttons', async () => {
    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    expect(screen.getByText('Corporate')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
  })

  it('highlights selected style', async () => {
    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Corporate Classic"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const corporateButton = screen.getByText('Corporate')
    expect(corporateButton).toHaveClass('bg-yellow-500')
  })

  it('calls onStyleChange when style button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const executiveButton = screen.getByText('Executive')
    await user.click(executiveButton)

    expect(mockOnStyleChange).toHaveBeenCalledWith('Executive Portrait')
  })

  it('calls onCapture when capture button is clicked', async () => {
    const user = userEvent.setup()

    // Mock canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(),
      drawImage: vi.fn()
    }))
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockImage')

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    expect(mockOnCapture).toHaveBeenCalledWith(expect.stringContaining('data:image'))
  })

  it('stops camera stream after capturing photo', async () => {
    const user = userEvent.setup()
    const mockStopTrack = vi.fn()
    const streamWithStop = {
      getTracks: () => [{ stop: mockStopTrack }]
    }
    mockGetUserMedia.mockResolvedValue(streamWithStop)

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(),
      drawImage: vi.fn()
    }))
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockImage')

    render(
      <CameraCapture
        onCapture={mockOnCapture}
        selectedStyle="Creative Professional"
        onStyleChange={mockOnStyleChange}
      />
    )

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled()
    })

    const captureButton = screen.getByLabelText('Capture photo')
    await user.click(captureButton)

    expect(mockStopTrack).toHaveBeenCalled()
  })
})
