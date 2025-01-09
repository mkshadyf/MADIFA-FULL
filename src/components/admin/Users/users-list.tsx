import { useState } from 'react'

import type { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import type { Permission, User, UserProfile } from '@/types/auth'

import UserDetailsModal from './user-details-modal'

type DatabaseUserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UsersListProps {
  users: DatabaseUserProfile[]
  onRefresh: () => void
}

export default function UsersList({ users }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<
    (User & { permissions?: Permission[] }) | null
  >(null)
  const [loading, setLoading] = useState(false)

  const handleUserClick = async (userProfile: DatabaseUserProfile) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.admin.getUserById(
      userProfile.user_id
    )
    if (userData?.user) {
      const userWithPermissions: User & { permissions?: Permission[] } = {
        ...userData.user,
        email_verified: !!userData.user.email_confirmed_at,
        phone_verified: !!userData.user.phone_confirmed_at,
        is_anonymous: false,
        is_confirmed: !!userData.user.confirmed_at,
        phone: userData.user.phone || null,
        role: userData.user.role || null,
        confirmed_at: userData.user.confirmed_at || null,
        email_confirmed_at: userData.user.email_confirmed_at || null,
        phone_confirmed_at: userData.user.phone_confirmed_at || null,
        banned_until: null,
        profile: userProfile as UserProfile,
        permissions:
          (userProfile as unknown as { permissions?: Permission[] })
            .permissions || [],
      }
      setSelectedUser(userWithPermissions)
    }
  }

  return (
    <>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                      {user.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {user.role}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {user.subscription_status}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      <button
                        onClick={() => handleUserClick(user)}
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
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  )
}
