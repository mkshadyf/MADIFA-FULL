import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fetch from 'node-fetch'
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

async function getExistingUser(email: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get user: ${JSON.stringify(error)}`)
  }

  const users = await response.json()
  return users.length > 0 ? users[0] : null
}

async function createAdminUser(email: string, password: string) {
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  })

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('No user returned from createUser')
  }

  return user
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create admin user with a unique email
    const adminEmail = 'admin@madifa.co.za'
    const adminPassword = 'Admin@123' // You should change this immediately after first login

    // First, check if the user already exists in auth.users
    let user = await getExistingUser(adminEmail)

    if (!user) {
      // Create user using admin API with proper role in metadata
      const { data: { user: newUser }, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin' },
        app_metadata: { role: 'admin' }
      })

      if (error) {
        console.error('❌ Error creating admin user:', error.message)
        throw error
      }

      user = newUser
      console.log('✅ Admin user created in auth.users')
    } else {
      // Update existing user's metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { role: 'admin' }, app_metadata: { role: 'admin' } }
      )

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message)
        throw updateError
      }
      console.log('ℹ️ Admin user already exists in auth.users')
    }

    // Use raw SQL to bypass RLS for initial setup
    const { error: profileError } = await supabase.rpc('create_initial_profile', {
      p_user_id: user.id,
      p_email: adminEmail,
      p_full_name: 'Admin User',
      p_role: 'admin'
    })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message)
      throw profileError
    }

    console.log('✅ Admin profile created/updated')

    // Create default permissions
    const permissions = [
      { name: 'manage_users', description: 'Can manage all users', resource: 'users', action: 'manage' },
      { name: 'manage_content', description: 'Can manage all content', resource: 'content', action: 'manage' },
      { name: 'manage_settings', description: 'Can manage system settings', resource: 'settings', action: 'manage' },
      { name: 'view_analytics', description: 'Can view analytics', resource: 'analytics', action: 'read' },
    ]

    // Use raw SQL to bypass RLS for initial permissions setup
    for (const permission of permissions) {
      const { error: permissionError } = await supabase.rpc('create_initial_permission', {
        p_name: permission.name,
        p_description: permission.description,
        p_resource: permission.resource,
        p_action: permission.action
      })

      if (permissionError) {
        console.error(`❌ Error creating permission ${permission.name}:`, permissionError.message)
        throw permissionError
      }
    }

    console.log('✅ Default permissions created/updated')

    // Fetch all permissions
    const { data: permissionData, error: permissionFetchError } = await supabase
      .from('permissions')
      .select('id')

    if (permissionFetchError) {
      console.error('❌ Error fetching permissions:', permissionFetchError.message)
      throw permissionFetchError
    }

    // Assign permissions to admin role using raw SQL
    for (const permission of permissionData) {
      const { error: rolePermissionError } = await supabase.rpc('create_initial_role_permission', {
        p_role: 'admin',
        p_permission_id: permission.id
      })

      if (rolePermissionError) {
        console.error('❌ Error assigning permission:', rolePermissionError.message)
        throw rolePermissionError
      }
    }

    console.log('✅ Permissions assigned to admin role')

    console.log('\n✨ Database seeding completed successfully!')
    console.log('\nAdmin Credentials:')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('\n⚠️  Please change the admin password after first login!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase() 