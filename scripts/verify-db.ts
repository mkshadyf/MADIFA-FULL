import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyTables() {
  const tables = [
    'categories',
    'content',
    'user_preferences',
    'user_lists',
    'watch_history',
    'subscriptions'
  ]

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count')
      .limit(1)

    if (error) {
      console.error(`Error verifying table ${table}:`, error)
    } else {
      console.log(`✓ Table ${table} exists`)
    }
  }
}

async function verifyPolicies() {
  // This requires more advanced querying of Supabase's internal tables
  console.log('Verifying RLS policies...')
  const { data: policies } = await supabase.rpc('get_policies')
  console.log('Found policies:', policies)
}

async function main() {
  try {
    await verifyTables()
    await verifyPolicies()
    console.log('Database verification completed')
  } catch (error) {
    console.error('Error verifying database:', error)
    process.exit(1)
  }
}

main() 