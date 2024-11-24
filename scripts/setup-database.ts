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
      persistSession: false
    }
  }
)

async function executeSql(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠ Object already exists, continuing...')
        return
      }
      console.error('SQL Error:', error)
      throw error
    }

    return data
  } catch (error: unknown) {
    // If the exec_sql function doesn't exist, create it
    if ((error as Error).message?.includes('function exec_sql() does not exist')) {
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION exec_sql(query text)
        RETURNS void AS $$
        BEGIN
          EXECUTE query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `

      // Execute directly through REST API
      const { error: funcError } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', createFunctionSql)
        .single()

      if (funcError && !funcError.message.includes('already exists')) {
        throw funcError
      }

      // Try executing the original query again
      return executeSql(sql)
    }

    throw error
  }
}

async function runMigrations() {
  console.log('Running migrations...')

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')

  try {
    // Read migration file
    const migrationSql = await readFile(
      join(migrationsDir, '00000000000000_init.sql'),
      'utf8'
    )

    // Split into individual statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // Execute each statement
    for (const sql of statements) {
      try {
        console.log('Executing:', sql.substring(0, 50) + '...')
        await executeSql(sql)
        console.log('✓ Statement executed successfully')
      } catch (error: unknown) {
        if ((error as Error).message?.includes('already exists')) {
          console.log('⚠ Object already exists, continuing...')
          continue
        }
        throw error
      }
    }

    console.log('✓ All migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

async function main() {
  try {
    await runMigrations()
    console.log('Database setup completed')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

main() 