import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get session to check if user exists
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select()
        .eq('user_id', session.user.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile) {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata.full_name
          })
      }
    }

    // Redirect to app
    return NextResponse.redirect(new URL('/browse', request.url))
  }

  // Return error if no code
  return NextResponse.json(
    { error: 'No code provided' },
    { status: 400 }
  )
} 