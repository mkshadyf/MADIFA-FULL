import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'moderator' | 'user'

interface Permission {
  action: string
  resource: string
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { action: '*', resource: '*' }
  ],
  moderator: [
    { action: 'read', resource: '*' },
    { action: 'update', resource: 'content' },
    { action: 'delete', resource: 'content' },
    { action: 'create', resource: 'content' }
  ],
  user: [
    { action: 'read', resource: 'content' },
    { action: 'update', resource: 'profile' }
  ]
}

export async function getUserRole(userId: string): Promise<Role> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data?.role || 'user'
}

export async function hasPermission(
  userId: string,
  action: string,
  resource: string
): Promise<boolean> {
  const role = await getUserRole(userId)
  const permissions = rolePermissions[role]

  return permissions.some(permission =>
    (permission.action === '*' || permission.action === action) &&
    (permission.resource === '*' || permission.resource === resource)
  )
}

export async function assignRole(userId: string, role: Role) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('user_id', userId)

  if (error) throw error
} 