import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'

export const usePaymentPolling = () => {
    const { refreshCredits } = useUser()

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
}
