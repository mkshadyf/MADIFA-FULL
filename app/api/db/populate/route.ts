import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.rpc('populate_database')
    
    if (error) throw error

    return NextResponse.json({ 
      message: 'Database populated successfully' 
    })

  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { 
        message: 'Error populating database',
        error: err.message 
      },
      { status: 400 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 