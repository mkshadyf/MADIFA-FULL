import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
} 