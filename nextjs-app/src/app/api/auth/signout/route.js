import { NextResponse } from 'next/server'

const SUPABASE_COOKIE_NAMES = getSupabaseAuthCookieNames()

export async function POST() {
  const response = NextResponse.json({ success: true })

  SUPABASE_COOKIE_NAMES.forEach(name => {
    response.cookies.set({
      name,
      value: '',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    })
  })

  return response
}

function getSupabaseAuthCookieNames() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!supabaseUrl) return []

  try {
    const host = new URL(supabaseUrl).host
    const projectRef = host.split('.')[0]

    if (!projectRef) return []

    return [
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-refresh-token`,
    ]
  } catch (error) {
    console.warn('[API] Failed to derive Supabase cookie names:', error)
    return []
  }
}
