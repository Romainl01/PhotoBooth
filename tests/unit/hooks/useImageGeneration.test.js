import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useImageGeneration } from '../../../nextjs-app/src/hooks/useImageGeneration.js'

// Mock dependencies
const mockUpdateCredits = vi.fn()
const mockRefreshCredits = vi.fn()

vi.mock('@/contexts/UserContext', () => ({
    useUser: () => ({
        updateCredits: mockUpdateCredits,
        refreshCredits: mockRefreshCredits
    })
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            refreshSession: vi.fn().mockResolvedValue({ data: { session: {} }, error: null })
        }
    })
}))

describe('useImageGeneration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true
        })
    })

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useImageGeneration())

        expect(result.current.isGenerating).toBe(false)
        expect(result.current.generatedImage).toBe(null)
        expect(result.current.error).toBe(null)
    })

    it('should handle successful generation', async () => {
        const mockImage = 'base64-image-data'.repeat(10) // Make it long enough
        const mockResponse = { success: true, image: 'generated-url', credits: 10 }

        global.fetch.mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(mockResponse)
        })

        const { result } = renderHook(() => useImageGeneration())

        let response
        await act(async () => {
            response = await result.current.generateImage(mockImage, 'Style')
        })

        expect(response.success).toBe(true)
        expect(response.image).toBe('generated-url')
        expect(result.current.generatedImage).toBe('generated-url')
        expect(result.current.isGenerating).toBe(false)
        expect(mockUpdateCredits).toHaveBeenCalledWith(10)
    })

    it('should handle API error', async () => {
        const mockImage = 'base64-image-data'.repeat(10)
        const mockResponse = { success: false, error: 'API Error' }

        global.fetch.mockResolvedValueOnce({
            status: 500,
            json: () => Promise.resolve(mockResponse)
        })

        const { result } = renderHook(() => useImageGeneration())

        let response
        await act(async () => {
            response = await result.current.generateImage(mockImage, 'Style')
        })

        expect(response.success).toBe(false)
        expect(result.current.error).toEqual({ code: 'API_ERROR', message: 'API Error' })
        expect(result.current.isGenerating).toBe(false)
    })

    it('should handle insufficient credits (402)', async () => {
        const mockImage = 'base64-image-data'.repeat(10)

        global.fetch.mockResolvedValueOnce({
            status: 402,
            json: () => Promise.resolve({})
        })

        const { result } = renderHook(() => useImageGeneration())

        let response
        await act(async () => {
            response = await result.current.generateImage(mockImage, 'Style')
        })

        expect(response.success).toBe(false)
        expect(result.current.error).toEqual({ code: 'INSUFFICIENT_CREDITS', message: 'Insufficient credits' })
    })
})
