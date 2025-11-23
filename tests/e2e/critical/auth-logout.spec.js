import { test, expect } from '@playwright/test'

const AUTH_STORAGE_KEYS = getSupabaseAuthStorageKeys()
const AUTH_COOKIE_NAME = getSupabaseAuthCookieName()
const E2E_USER_STORAGE_KEY = '__e2e_user__'
const E2E_PROFILE_STORAGE_KEY = '__e2e_profile__'
const E2E_AUTH_EVENT_NAME = 'e2e-auth-changed'
const MOCK_USER = {
  id: 'e2e-playwright-user',
  email: 'playwright-user@morpheo.dev',
}

test.describe('Authentication - Logout', () => {
  test('should completely clear session on logout', async ({ page, context }) => {
    await mockCameraFeed(context)

    // Load public route first so we can seed storage on the right origin
    await page.goto('/sign-in')

    await mockSupabaseSession(page, context)
    await page.goto('/')

    const userMenuButton = page.getByTestId('user-menu')
    await expect(userMenuButton).toBeVisible()

    // Open settings drawer and log out
    await userMenuButton.click()
    const logoutButton = page.getByTestId('logout-button')
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()

    await page.waitForURL('**/sign-in')

    // 1. Verify Supabase auth cookies are gone
    const cookies = await context.cookies()
    const hasSupabaseCookie = cookies.some(cookie => cookie.name.startsWith('sb-'))
    expect(hasSupabaseCookie).toBeFalsy()

    // 2. Verify auth tokens are removed from localStorage
    const storedTokens = await page.evaluate(keys => {
      return keys.map(key => ({ key, value: localStorage.getItem(key) }))
    }, AUTH_STORAGE_KEYS)

    storedTokens.forEach(({ value }) => {
      expect(value).toBeNull()
    })

    const e2eState = await page.evaluate(([userKey, profileKey]) => {
      return {
        user: localStorage.getItem(userKey),
        profile: localStorage.getItem(profileKey),
      }
    }, [E2E_USER_STORAGE_KEY, E2E_PROFILE_STORAGE_KEY])

    expect(e2eState.user).toBeNull()
    expect(e2eState.profile).toBeNull()

    // 3. UI shows logged-out state
    await expect(page.getByTestId('sign-in-button')).toBeVisible()
    await expect(page.getByTestId('user-menu')).toHaveCount(0)

    // 4. Protected routes redirect back to sign-in
    await page.goto('/')
    await expect(page).toHaveURL(/\/sign-in$/)

    // 5. Reloading should not restore session
    await page.reload()
    await expect(page.getByTestId('sign-in-button')).toBeVisible()
  })

  test('should clear session across open tabs', async ({ context }) => {
    await mockCameraFeed(context)

    const pageA = await context.newPage()
    const pageB = await context.newPage()

    await pageA.goto('/sign-in')
    await pageB.goto('/sign-in')

    await mockSupabaseSession(pageA, context)
    await mockSupabaseSession(pageB, context)

    await pageA.goto('/')
    await pageB.goto('/')

    await expect(pageA.getByTestId('user-menu')).toBeVisible()
    await expect(pageB.getByTestId('user-menu')).toBeVisible()

    await pageA.getByTestId('user-menu').click()
    await pageA.getByTestId('logout-button').click()
    await pageA.waitForURL('**/sign-in')
    await expect(pageA.getByTestId('sign-in-button')).toBeVisible()

    const cookiesA = await context.cookies()
    expect(cookiesA.some(cookie => cookie.name.startsWith('sb-'))).toBeFalsy()

    await pageB.reload()
    await expect(pageB.getByTestId('sign-in-button')).toBeVisible()
    await expect(pageB.getByTestId('user-menu')).toHaveCount(0)
    const tabBState = await pageB.evaluate(([userKey, profileKey]) => {
      return {
        user: localStorage.getItem(userKey),
        profile: localStorage.getItem(profileKey),
      }
    }, [E2E_USER_STORAGE_KEY, E2E_PROFILE_STORAGE_KEY])
    expect(tabBState.user).toBeNull()
    expect(tabBState.profile).toBeNull()

    await context.close()
  })
})

async function mockSupabaseSession(page, context) {
  const currentUrl = new URL(page.url())
  const domain = currentUrl.hostname

  if (AUTH_COOKIE_NAME) {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: createSupabaseCookieValue(),
        domain,
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
      },
    ])
  }

  const payload = JSON.stringify({
    currentSession: {
      access_token: 'playwright-access-token',
      refresh_token: 'playwright-refresh-token',
      token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: MOCK_USER,
    },
    currentUser: MOCK_USER,
  })

  await page.evaluate(([keys, value]) => {
    keys.forEach(key => {
      localStorage.setItem(key, value)
    })
  }, [AUTH_STORAGE_KEYS, payload])

  await page.evaluate(([userKey, profileKey, eventName, user]) => {
    const mockedProfile = {
      id: user.id,
      credits: 10,
      email: user.email,
    }
    localStorage.setItem(userKey, JSON.stringify(user))
    localStorage.setItem(profileKey, JSON.stringify(mockedProfile))
    window.dispatchEvent(new Event(eventName))
  }, [E2E_USER_STORAGE_KEY, E2E_PROFILE_STORAGE_KEY, E2E_AUTH_EVENT_NAME, MOCK_USER])
}

async function mockCameraFeed(context) {
  await context.addInitScript(() => {
    try {
      const fakeStream = {
        id: 'playwright-camera-stream',
        active: true,
        getTracks() {
          return [
            {
              kind: 'video',
              stop() { },
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
    } catch (error) {
      console.warn('Failed to mock camera feed for tests:', error)
    }
  })
}

function getSupabaseAuthStorageKeys() {
  const keys = ['supabase.auth.token']
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  if (supabaseUrl) {
    try {
      const host = new URL(supabaseUrl).host
      const projectRef = host.split('.')[0]
      if (projectRef) {
        keys.push(`sb-${projectRef}-auth-token`)
      }
    } catch (error) {
      // Ignore invalid URLs and fall back to default key
    }
  }

  return keys
}

function getSupabaseAuthCookieName() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!supabaseUrl) return null

  try {
    const host = new URL(supabaseUrl).host
    const projectRef = host.split('.')[0]
    if (!projectRef) return null
    return `sb-${projectRef}-auth-token`
  } catch (error) {
    return null
  }
}

function createSupabaseCookieValue() {
  const payload = JSON.stringify({
    currentSession: {
      access_token: 'playwright-access-token',
      refresh_token: 'playwright-refresh-token',
      token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      user: MOCK_USER,
    },
    currentUser: MOCK_USER,
  })

  const base64 = Buffer.from(payload).toString('base64')
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `base64-${base64Url}`
}
