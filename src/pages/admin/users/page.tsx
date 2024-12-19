import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    void fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubscription = async (
    userId: string,
    tier: string,
    status: string
  ) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      void fetchUsers()
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      <div className="overflow-hidden rounded-lg bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Joined
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white">
                      {user.full_name?.[0] ?? '?'}
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
                    title="Subscription Tier"
                    value={user.subscription_tier}
                    onChange={e =>
                      handleUpdateSubscription(
                        user.id,
                        e.target.value,
                        user.subscription_status ?? 'inactive'
                      )
                    }
                    className="rounded-md bg-gray-700 px-2 py-1 text-white"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    title="Subscription Status"
                    value={user.subscription_status}
                    onChange={e =>
                      handleUpdateSubscription(
                        user.id,
                        user.subscription_tier ?? 'free',
                        e.target.value
                      )
                    }
                    className="rounded-md bg-gray-700 px-2 py-1 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="past_due">Past Due</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  <button
                    onClick={() => setSelectedUser(user)}
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

      {/* Add user details modal here */}
    </div>
  )
}
