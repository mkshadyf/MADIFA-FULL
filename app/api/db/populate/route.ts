import { Database } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

type TableName = keyof Database['public']['Tables']

export async function POST(request: Request) {
  const supabase = createClient()
  const { table, data } = await request.json()

  // Validate table name
  if (!isValidTable(table)) {
    return new Response('Invalid table name', { status: 400 })
  }

  try {
    const { error } = await supabase
      .from(table)
      .insert(data)

    if (error) throw error
    return new Response('Data populated successfully', { status: 200 })
  } catch (error) {
    console.error('Error populating data:', error)
    return new Response('Error populating data', { status: 500 })
  }
}

function isValidTable(table: string): table is TableName {
  const validTables: TableName[] = ['user_profiles', 'content', 'categories', 'user_preferences']
  return validTables.includes(table as TableName)
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 