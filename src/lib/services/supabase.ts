import type { SupabaseError } from '@/types/error'
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

export function handleSupabaseError(error: unknown): SupabaseError {
  if (error instanceof Error) {
    return {
      name: 'SupabaseError',
      code: 'supabase_error',
      message: error.message,
      details: error.stack,
      originalError: error,
    }
  }

  if (typeof error === 'string') {
    return {
      name: 'SupabaseError',
      code: 'supabase_error',
      message: error,
      details: error,
    }
  }

  return {
    name: 'SupabaseError',
    code: 'unknown_error',
    message: 'An unknown error occurred with Supabase',
    details: String(error),
  }
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}
