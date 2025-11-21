import { useRef, useState, useEffect, useCallback } from 'react'

export const useCamera = (disableCameraForTests = false) => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const [cameraError, setCameraError] = useState(null)
    const [isReady, setIsReady] = useState(false)

    const initializeCamera = useCallback(async () => {
        if (disableCameraForTests) return

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
                setIsReady(true)
                setCameraError(null)
            }
        } catch (error) {
            console.error('Camera access error:', error)
            setCameraError(error)
            setIsReady(false)
        }
    }, [disableCameraForTests])

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
            setIsReady(false)
        }
    }, [])

    const captureImage = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null

        const video = videoRef.current
        const canvas = canvasRef.current

        // Validate video is ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Video not ready - dimensions are 0')
            return null
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Validate canvas dimensions
        if (canvas.width === 0 || canvas.height === 0) {
            console.error('Canvas initialization failed - dimensions are 0')
            return null
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
            return null
        }

        return imageData
    }, [])

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    return {
        videoRef,
        canvasRef,
        cameraError,
        isReady,
        initializeCamera,
        stopCamera,
        captureImage
    }
}
