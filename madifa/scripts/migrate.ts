import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the root .env file
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSql(statement: string) {
  try {
    const { error } = await supabase.rpc('exec', {
      sql: statement
    })

    if (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️ Object already exists, continuing...')
        return
      }
      throw error
    }
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️ Object already exists, continuing...')
      return
    }
    throw error
  }
}

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...')

    // First, create the exec function
    const execFunctionSQL = readFileSync(
      join(__dirname, '..', 'supabase', 'migrations', '20240115000000_create_exec_function.sql'),
      'utf8'
    )

    console.log('Creating exec function...')
    await executeSql(execFunctionSQL)

    // Get all migration files
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .filter(file => !file.includes('create_exec_function')) // Skip exec function file
      .sort() // Sort to ensure correct order

    console.log(`Found ${migrationFiles.length} migration files`)

    // Create migrations table if it doesn't exist
    await executeSql(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Execute each migration file
    for (const file of migrationFiles) {
      // Check if migration was already executed
      const { data: executed } = await supabase
        .from('_migrations')
        .select('*')
        .eq('name', file)
        .single()

      if (executed) {
        console.log(`\n📄 Skipping ${file} (already executed)...`)
        continue
      }

      console.log(`\n📄 Processing ${file}...`)

      // Read the migration SQL file
      const migrationSQL = readFileSync(join(migrationsDir, file), 'utf8')

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Execute each statement
      for (const statement of statements) {
        try {
          await executeSql(statement)
        } catch (error: any) {
          console.error('Failed statement:', statement)
          throw error
        }
      }

      // Record the migration
      await supabase
        .from('_migrations')
        .insert([{ name: file }])

      console.log(`✅ Completed ${file}`)
    }

    console.log('\n✨ All migrations completed successfully!')

  } catch (error) {
    console.error('❌ Error running migrations:', error)
    process.exit(1)
  }
}

runMigration() 