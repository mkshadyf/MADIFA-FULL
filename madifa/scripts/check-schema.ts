import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
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

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...')

    // Check user_profiles table
    const { data: userProfilesSchema, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (userProfilesError) {
      console.error('❌ Error checking user_profiles schema:', userProfilesError.message)
      throw userProfilesError
    }

    // Check permissions table
    const { data: permissionsSchema, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .limit(1)

    if (permissionsError) {
      console.error('❌ Error checking permissions schema:', permissionsError.message)
      throw permissionsError
    }

    // Check role_permissions table
    const { data: rolePermissionsSchema, error: rolePermissionsError } = await supabase
      .from('role_permissions')
      .select('*')
      .limit(1)

    if (rolePermissionsError) {
      console.error('❌ Error checking role_permissions schema:', rolePermissionsError.message)
      throw rolePermissionsError
    }

    console.log('\n📊 Database Schema:')
    console.log('\nuser_profiles columns:', Object.keys(userProfilesSchema?.[0] || {}))
    console.log('\npermissions columns:', Object.keys(permissionsSchema?.[0] || {}))
    console.log('\nrole_permissions columns:', Object.keys(rolePermissionsSchema?.[0] || {}))

  } catch (error) {
    console.error('❌ Error checking schema:', error)
    process.exit(1)
  }
}

checkSchema() 