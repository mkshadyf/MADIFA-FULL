

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

  const handleUpdateSubscription = async (userId: string, tier: string, status: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
      onRefresh()
    } catch (error) {
      console.error('Error updating subscription:', error)
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Subscription
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
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
                    value={user.subscription_tier}
                    onChange={(e) => handleUpdateSubscription(user.user_id, e.target.value, user.subscription_status)}
                    disabled={loading}
                    className="bg-gray-700 text-white rounded-md px-2 py-1"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    user.subscription_status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  )
} 
