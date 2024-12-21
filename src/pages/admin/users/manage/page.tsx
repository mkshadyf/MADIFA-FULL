import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function ManageUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, selectedRole])

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(
          `email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
        )
      }

      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('user_id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white"
          />
          <select
            title="Role"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {users.map(user => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700">
                      {user.full_name[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    title="Role"
                    value={user.role || 'user'}
                    onChange={e =>
                      handleRoleChange(user.user_id, e.target.value)
                    }
                    className="rounded-md bg-gray-700 px-2 py-1 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.subscription_status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  <button
                    onClick={() => {
                      /* Handle view details */
                    }}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
