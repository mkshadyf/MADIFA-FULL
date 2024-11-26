

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface RoleAssignment {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'user'
  assigned_by: string
  assigned_at: string
}

export default function UserRoles() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roleAssignments, setRoleAssignments] = useState<Record<string, RoleAssignment>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get all users
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (userError) throw userError

        // Get role assignments
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')

        if (roleError) throw roleError

        // Create role assignments map
        const roleMap = roleData?.reduce((acc, role) => {
          acc[role.user_id] = role
          return acc
        }, {} as Record<string, RoleAssignment>)

        setUsers(userData || [])
        setRoleAssignments(roleMap || {})
      } catch (error) {
        console.error('Error fetching users and roles:', error)
        setError('Failed to load users and roles')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: currentUser } = await supabase.auth.getUser()
      
      if (!currentUser.user) throw new Error('Not authenticated')

      const assignment = roleAssignments[userId]
      
      if (assignment) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({
            role: newRole,
            assigned_by: currentUser.user.id,
            assigned_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Create new role assignment
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole,
            assigned_by: currentUser.user.id,
            assigned_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Update local state
      setRoleAssignments(prev => ({
        ...prev,
        [userId]: {
          id: assignment?.id || crypto.randomUUID(),
          user_id: userId,
          role: newRole,
          assigned_by: currentUser.user.id,
          assigned_at: new Date().toISOString()
        }
      }))

      setSuccess('Role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      setError('Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">User Roles</h2>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{user.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={roleAssignments[user.user_id]?.role || 'user'}
                    onChange={(e) => handleRoleChange(
                      user.user_id, 
                      e.target.value as 'admin' | 'moderator' | 'user'
                    )}
                    disabled={saving}
                    className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {roleAssignments[user.user_id]?.assigned_at
                    ? new Date(roleAssignments[user.user_id].assigned_at).toLocaleString()
                    : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}
    </div>
  )
} 
