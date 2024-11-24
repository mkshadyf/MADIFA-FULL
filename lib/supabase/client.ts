import type { Database } from '@/types/supabase'
import type { CookieOptions } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Only create the client if we're in the browser
  if (typeof window !== 'undefined') {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
              ?.split('=')[1]
          },
          set(name: string, value: string, options: CookieOptions) {
            document.cookie = `${name}=${value}; path=${options.path || '/'}`
          },
          remove(name: string, options: CookieOptions) {
            document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          },
        },
      }
    )
  }

  // Return null for server-side
  return null
} 