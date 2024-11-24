import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

async function executeSql(sql: string) {
  try {
    // First try to execute directly
    const { data, error } = await supabase.rpc('exec_sql_unsafe', {
      sql_query: sql
    })

    if (error) {
      console.error('SQL execution error:', error)
      // Try to create the function if it doesn't exist
      if (error.message.includes('function exec_sql_unsafe() does not exist')) {
        await createExecFunction()
        // Retry the original query
        return executeSql(sql)
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error executing SQL:', error)
    throw error
  }
}

async function createExecFunction() {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql_unsafe(sql_query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION exec_sql_unsafe(text) TO service_role;
  `

  const { error } = await supabase
    .from('_sql')
    .select('*')
    .eq('query', createFunctionSql)
    .single()

  if (error && !error.message.includes('already exists')) {
    throw error
  }
}

async function setupDatabase() {
  console.log('Setting up database...')

  try {
    const initSql = await readFile(
      join(__dirname, '..', 'supabase/migrations/00000000000000_init.sql'),
      'utf8'
    )

    const statements = initSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const sql of statements) {
      try {
        console.log(`Executing: ${sql.substring(0, 100)}...`)
        await executeSql(sql)
        console.log('✓ Statement executed successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log('⚠ Object already exists, continuing...')
          continue
        }
        throw error
      }
    }

    console.log('✓ Database setup completed')
  } catch (error) {
    console.error('Error setting up database:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

setupDatabase().catch(console.error) 