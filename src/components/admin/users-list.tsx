import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

import UserDetailsModal from './user-details-modal'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UsersListProps {
  users: UserProfile[]
  onRefresh: () => void
}

export default function UsersList({ users, onRefresh }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleUpdateSubscription = async (
    userId: string,
    tier: string,
    status: string
  ) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error
      onRefresh()
    } catch (error) {
      logger.error('Error updating subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Subscription
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
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
                    value={user.subscription_tier}
                    onChange={e =>
                      handleUpdateSubscription(
                        user.user_id,
                        e.target.value,
                        user.subscription_status
                      )
                    }
                    disabled={loading}
                    className="rounded-md bg-gray-700 px-2 py-1 text-white"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.subscription_status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.subscription_status}
                  </span>
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

      {selectedUser ? (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      ) : null}
    </>
  )
}
