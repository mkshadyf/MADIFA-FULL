import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/roles'

export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(r => r.role) || []
  } catch (error) {
    console.error('Error getting user roles:', error)
    return []
  }
}

export async function addUserRole(userId: string, role: Role): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error adding user role:', error)
    throw error
  }
}

export async function removeUserRole(
  userId: string,
  role: Role
): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)

    if (error) throw error
  } catch (error) {
    console.error('Error removing user role:', error)
    throw error
  }
}

export async function hasRole(userId: string, role: Role): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId)
    return roles.includes(role)
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}
