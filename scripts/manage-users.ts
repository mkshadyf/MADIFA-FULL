import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import readline from 'readline'
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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function listUsers() {
  const { data: users, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('❌ Error listing users:', error.message)
    return []
  }
  return users.users
}

async function deleteUser(userId: string) {
  try {
    // First delete user profile using RPC to bypass RLS
    const { error: profileError } = await supabase.rpc('delete_user_profile', {
      p_user_id: userId
    })

    if (profileError) {
      console.error('❌ Error deleting user profile:', profileError.message)
      throw profileError
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('❌ Error deleting auth user:', authError.message)
      throw authError
    }

    console.log('✅ User and associated data deleted successfully')
  } catch (error) {
    console.error('❌ Error during deletion:', error)
    throw error
  }
}

async function createAdminUser(email: string, password: string, fullName: string) {
  try {
    // Create user in auth.users with proper metadata
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      app_metadata: { role: 'admin' }  // This is important for RLS policies
    })

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error('No user returned from createUser')
    }

    // Use the stored procedure to create profile (bypasses RLS)
    const { error: profileError } = await supabase.rpc('create_initial_profile', {
      p_user_id: user.id,
      p_email: email,
      p_full_name: fullName,
      p_role: 'admin'
    })

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id)
      throw profileError
    }

    // Fetch all permissions to assign to the admin
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id')

    if (permError) {
      throw permError
    }

    // Assign all permissions using stored procedure
    for (const perm of permissions || []) {
      const { error: rolePermError } = await supabase.rpc('create_initial_role_permission', {
        p_role: 'admin',
        p_permission_id: perm.id
      })

      if (rolePermError) {
        console.error(`Warning: Failed to assign permission ${perm.id}:`, rolePermError)
      }
    }

    return user
  } catch (error) {
    throw error
  }
}

async function handleAdminCreation() {
  try {
    console.log('\n👤 Create New Admin User')

    while (true) {
      const email = await question('Enter admin email: ')
      const users = await listUsers()
      const existingUser = users.find(u => u.email === email)

      if (existingUser) {
        console.log(`\n⚠️ User with email ${email} already exists!`)
        const action = await question('Do you want to (1) delete existing user and create new, or (2) try different email? (1/2): ')

        if (action === '1') {
          await deleteUser(existingUser.id)
          console.log('✅ Existing user deleted')
        } else if (action === '2') {
          continue
        } else {
          console.log('❌ Invalid choice. Operation cancelled.')
          return
        }
      }

      const password = await question('Enter password (min 8 chars, must include uppercase, lowercase, number): ')
      if (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)) {
        console.log('❌ Password does not meet requirements. Please try again.')
        continue
      }

      const confirmPassword = await question('Confirm password: ')
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match. Please try again.')
        continue
      }

      const fullName = await question('Enter full name: ')
      if (!fullName.trim()) {
        console.log('❌ Full name is required. Please try again.')
        continue
      }

      try {
        const user = await createAdminUser(email, password, fullName)
        console.log('\n✅ Admin user created successfully!')
        console.log('Details:')
        console.log(`Email: ${email}`)
        console.log(`Full Name: ${fullName}`)
        console.log(`ID: ${user.id}`)
        break
      } catch (error: any) {
        console.error('❌ Error creating admin user:', error.message)
        const retry = await question('Would you like to try again? (yes/no): ')
        if (retry.toLowerCase() !== 'yes') {
          break
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in admin creation process:', error)
    throw error
  }
}

async function deleteAllUsers() {
  try {
    const users = await listUsers()

    if (users.length === 0) {
      console.log('ℹ️ No users to delete')
      return
    }

    console.log('\n⚠️ WARNING: You are about to delete ALL users!')
    console.log('This will delete:')
    console.log(`- ${users.length} user(s)`)
    console.log('- All associated profiles')
    console.log('- All associated permissions')
    console.log('- All user data')

    const confirm1 = await question('\n⚠️ Type "DELETE ALL USERS" to confirm: ')
    if (confirm1.toUpperCase() !== 'DELETE ALL USERS') {
      console.log('Operation cancelled - First confirmation failed')
      return
    }

    const confirm2 = await question('\n⚠️ Are you ABSOLUTELY sure? Type "YES" to proceed: ')
    if (!['YES', 'Y'].includes(confirm2.toUpperCase())) {
      console.log('Operation cancelled - Second confirmation failed')
      return
    }

    console.log('\n🗑️ Deleting all users...')

    let successCount = 0
    let failureCount = 0

    for (const user of users) {
      try {
        console.log(`\nDeleting user: ${user.email}`)
        await deleteUser(user.id)
        successCount++
        console.log(`Progress: ${successCount}/${users.length} users deleted`)
      } catch (error) {
        console.error(`❌ Error deleting user ${user.email}:`, error)
        failureCount++
        const continueDelete = await question('\nContinue with remaining users? (Y/N): ')
        if (!['Y', 'YES'].includes(continueDelete.toUpperCase())) {
          console.log('Deletion process stopped')
          break
        }
      }
    }

    console.log('\n📊 Deletion Summary:')
    console.log(`✅ Successfully deleted: ${successCount} users`)
    if (failureCount > 0) {
      console.log(`❌ Failed to delete: ${failureCount} users`)
    }
    console.log(`Total processed: ${successCount + failureCount}/${users.length}`)
  } catch (error) {
    console.error('❌ Error during bulk deletion:', error)
    throw error
  }
}

async function manageUsers() {
  try {
    while (true) {
      console.log('\n🔧 User Management Menu:')
      console.log('1. List all users')
      console.log('2. Delete user by email')
      console.log('3. Delete user by ID')
      console.log('4. Delete ALL users')
      console.log('5. Create admin user')
      console.log('6. Exit')

      const choice = await question('\nEnter your choice (1-6): ')

      switch (choice) {
        case '1': {
          console.log('\n📋 Current Users:')
          const users = await listUsers()
          users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`)
            console.log(`   Email: ${user.email}`)
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
            console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)
            console.log(`   Role: ${user.role}`)
            console.log('---')
          })
          break
        }

        case '2': {
          const email = await question('\nEnter user email to delete: ')
          const users = await listUsers()
          const user = users.find(u => u.email === email)

          if (!user) {
            console.log('❌ User not found')
            break
          }

          const confirm = await question(`\n⚠️ Are you sure you want to delete user ${email}? This action cannot be undone! (yes/no): `)

          if (confirm.toLowerCase() === 'yes') {
            await deleteUser(user.id)
            console.log(`✅ User ${email} deleted successfully`)
          } else {
            console.log('Operation cancelled')
          }
          break
        }

        case '3': {
          const userId = await question('\nEnter user ID to delete: ')
          const users = await listUsers()
          const user = users.find(u => u.id === userId)

          if (!user) {
            console.log('❌ User not found')
            break
          }

          const confirm = await question(`\n⚠️ Are you sure you want to delete user ${user.email}? This action cannot be undone! (yes/no): `)

          if (confirm.toLowerCase() === 'yes') {
            await deleteUser(userId)
            console.log(`✅ User ${user.email} deleted successfully`)
          } else {
            console.log('Operation cancelled')
          }
          break
        }

        case '4': {
          await deleteAllUsers()
          break
        }

        case '5': {
          await handleAdminCreation()
          break
        }

        case '6': {
          console.log('\n👋 Goodbye!')
          rl.close()
          return
        }

        default: {
          console.log('\n❌ Invalid choice. Please try again.')
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
    rl.close()
    process.exit(1)
  }
}

// Add cleanup handler
rl.on('close', () => {
  process.exit(0)
})

manageUsers() 