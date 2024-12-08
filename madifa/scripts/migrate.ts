import { config } from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the root .env file
config({ path: join(__dirname, '..', '.env') })

const dbUrl = process.env.VITE_SUPABASE_DB_URL
if (!dbUrl) {
  console.error('❌ Missing database URL in .env file')
  process.exit(1)
}

const sql = postgres(dbUrl, {
  ssl: { rejectUnauthorized: false },
  max: 1
})

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...')

    // Get all migration files
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort() // Sort to ensure correct order

    console.log(`Found ${migrationFiles.length} migration files`)

    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Execute each migration file
    for (const file of migrationFiles) {
      // Check if migration was already executed
      const [executed] = await sql`
        SELECT * FROM _migrations WHERE name = ${file}
      `

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
          await sql.unsafe(statement)
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            console.log('ℹ️ Object already exists, continuing...')
            continue
          }
          console.error('Failed statement:', statement)
          throw error
        }
      }

      // Record the migration
      await sql`
        INSERT INTO _migrations (name) VALUES (${file})
      `

      console.log(`✅ Completed ${file}`)
    }

    console.log('\n✨ All migrations completed successfully!')
    await sql.end()

  } catch (error) {
    console.error('❌ Error running migrations:', error)
    await sql.end()
    process.exit(1)
  }
}

runMigration() 