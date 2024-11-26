

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import type { Database } from '@/lib/supabase/database.types'

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
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
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

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      {user.full_name[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.full_name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    className="bg-gray-700 text-white rounded-md px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => {/* Handle view details */}}
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
