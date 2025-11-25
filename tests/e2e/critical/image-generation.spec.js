import { test, expect } from '@playwright/test'

const E2E_USER_STORAGE_KEY = '__e2e_user__'
const E2E_PROFILE_STORAGE_KEY = '__e2e_profile__'
const E2E_AUTH_EVENT_NAME = 'e2e-auth-changed'
const MOCK_USER = {
  id: 'e2e-playwright-user',
  email: 'playwright-user@morpheo.dev',
}
const FIXTURE_PATH = 'tests/assets/upload.jpg'
const MOCK_RESULT =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGBYUGBgaHB4eHB8nJCQiLCsmKCUxNDA1NDQ0NDBMS0pJTk9MU1hUVmJnamtsb2P/wAALCAABAAEBASIA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCfAAf/2Q=='

test.describe('Image generation - flows', () => {
  test('upload → generate → download flow works', async ({ page, context }) => {
    await mockCameraFeed(context)
    await stubCanvasAndShareAPIs(context)
    await page.goto('/sign-in')
    await mockAuthState(page)

    await context.route('**/api/generate-headshot', async route => {
      const request = route.request()
      const body = JSON.parse(request.postData() ?? '{}')
      expect(body.image).toBeTruthy()
      expect(body.style).toBeTruthy()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          image: MOCK_RESULT,
          credits: 2,
        }),
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('user-menu')).toBeVisible()

    const uploadInput = page.locator('input[type="file"]')
    await uploadInput.setInputFiles(FIXTURE_PATH)

    await expect(page.locator('img[alt="Generated result"]')).toHaveAttribute('src', MOCK_RESULT)

    const profileState = await page.evaluate(key => {
      return localStorage.getItem(key)
    }, E2E_PROFILE_STORAGE_KEY)
    expect(profileState).toContain('"credits":2')

    const downloadPromise = page.waitForEvent('download')
    await page.getByLabel('Download photo').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/morpheo-photo/)
  })

  test('shows error UI when generation fails and allows retry', async ({ page, context }) => {
    await mockCameraFeed(context)
    await stubCanvasAndShareAPIs(context)
    await page.goto('/sign-in')
    await mockAuthState(page)

    let requestCount = 0
    await context.route('**/api/generate-headshot', async route => {
      requestCount += 1

      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'mock failure' }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          image: MOCK_RESULT,
          credits: 2,
        }),
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('user-menu')).toBeVisible()

    const uploadInput = page.locator('input[type="file"]')
    await uploadInput.setInputFiles(FIXTURE_PATH)

    await expect(page.getByText('Something went wrong')).toBeVisible()
    const retryButton = page.getByTestId('retry-button')
    await expect(retryButton).toBeVisible()

    const profileState = await page.evaluate(key => localStorage.getItem(key), E2E_PROFILE_STORAGE_KEY)
    expect(profileState).toContain('"credits":3')

    await retryButton.click()
    await expect(page.locator('img[alt="Generated result"]')).toHaveAttribute('src', MOCK_RESULT)
  })

  test('blocks generation when user has 0 credits and shows paywall', async ({ page, context }) => {
    await mockCameraFeed(context)
    await stubCanvasAndShareAPIs(context)
    await page.goto('/sign-in')
    await mockAuthState(page, { credits: 0 })

    let apiCalled = false
    await context.route('**/api/generate-headshot', async route => {
      apiCalled = true
      await route.fulfill({ status: 200, body: JSON.stringify({}) })
    })

    await page.goto('/')
    await expect(page.getByTestId('user-menu')).toBeVisible()

    await page.getByLabel('Upload photo').click()

    const paywall = page.getByTestId('paywall-modal')
    await expect(paywall).toBeVisible()
    await expect(paywall.getByText('Choose your pack')).toBeVisible()

    expect(apiCalled).toBeFalsy()

    const profileState = await page.evaluate(key => localStorage.getItem(key), E2E_PROFILE_STORAGE_KEY)
    expect(profileState).toContain('"credits":0')
  })
})

async function mockAuthState(page, { user = MOCK_USER, credits = 3 } = {}) {
  await page.evaluate(([userKey, profileKey, eventName, user, credits]) => {
    const profile = { id: user.id, credits, email: user.email }
    localStorage.setItem(userKey, JSON.stringify(user))
    localStorage.setItem(profileKey, JSON.stringify(profile))
    window.dispatchEvent(new Event(eventName))
  }, [E2E_USER_STORAGE_KEY, E2E_PROFILE_STORAGE_KEY, E2E_AUTH_EVENT_NAME, user, credits])
}

async function mockCameraFeed(context) {
  await context.addInitScript(() => {
    const fakeStream = {
      id: 'playwright-camera-stream',
      active: true,
      getTracks() {
        return [
          {
            kind: 'video',
            stop() {},
            enabled: true,
          },
        ]
      },
      getVideoTracks() {
        return this.getTracks()
      },
      getAudioTracks() {
        return []
      },
    }

    const originalDevices = navigator.mediaDevices || {}
    const patchedDevices = {
      ...originalDevices,
      getUserMedia: async () => fakeStream,
    }

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: patchedDevices,
    })
  })
}

async function stubCanvasAndShareAPIs(context) {
  await context.addInitScript(() => {
    HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
      const blob = new Blob(['playwright-watermark'], { type: 'image/jpeg' })
      callback(blob)
    }

    window.URL.createObjectURL = () => 'blob:playwright-watermark'
    window.URL.revokeObjectURL = () => {}

    navigator.share = async () => {}
  })
}
