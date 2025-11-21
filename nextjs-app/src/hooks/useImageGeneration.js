import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

export const useImageGeneration = () => {
    const { updateCredits, refreshCredits } = useUser()
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState(null)
    const [error, setError] = useState(null)

    const generateImage = async (imageData, style) => {
        // Validate inputs
        if (!imageData || imageData === 'data:,' || imageData.length < 100) {
            const err = { code: 'INVALID_IMAGE', message: 'Invalid or empty image data' }
            setError(err)
            return { success: false, error: err }
        }

        setIsGenerating(true)
        setError(null)

        try {
            // Refresh session before API call
            const supabase = createClient()

            // Add timeout to prevent hanging indefinitely (10 second timeout)
            const refreshPromise = supabase.auth.refreshSession()
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Session refresh timeout after 10s')), 10000)
            )

            try {
                const { error: refreshError } = await Promise.race([
                    refreshPromise,
                    timeoutPromise
                ])

                if (refreshError) {
                    console.warn('[Session] Failed to refresh session:', refreshError)
                }
            } catch (timeoutError) {
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

            // Handle 402 Payment Required
            if (response.status === 402) {
                const err = { code: 'INSUFFICIENT_CREDITS', message: 'Insufficient credits' }
                setError(err)
                return { success: false, error: err }
            }

            // Handle 401 Unauthorized
            if (response.status === 401) {
                window.location.href = '/sign-in'
                return { success: false, error: { code: 'UNAUTHORIZED' } }
            }

            if (data.success && data.image) {
                setGeneratedImage(data.image)

                // Update credits
                if (typeof data.credits === 'number') {
                    updateCredits(data.credits)
                } else {
                    refreshCredits().catch(err => {
                        console.warn('[Generate] Credit refresh failed (non-critical):', err)
                    })
                }

                return { success: true, image: data.image }
            } else {
                const err = { code: 'API_ERROR', message: data.error || 'Generation failed' }
                setError(err)
                return { success: false, error: err }
            }
        } catch (err) {
            console.error('Error generating image:', err)
            const errorObj = { code: 'API_ERROR', message: err.message }
            setError(errorObj)
            return { success: false, error: errorObj }
        } finally {
            setIsGenerating(false)
        }
    }

    const resetGeneration = () => {
        setGeneratedImage(null)
        setError(null)
        setIsGenerating(false)
    }

    return {
        generateImage,
        isGenerating,
        generatedImage,
        error,
        resetGeneration
    }
}
