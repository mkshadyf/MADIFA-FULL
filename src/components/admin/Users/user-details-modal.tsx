import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { Permission, User, UserProfile } from '@/types/auth'

interface UserDetailsModalProps {
  user: User & { permissions?: Permission[] }
  isOpen?: boolean
  onClose: () => void
}

export default function UserDetailsModal({
  user,
  isOpen = false,
  onClose,
}: UserDetailsModalProps) {
  if (!user) return null

  const profile = user.profile as UserProfile

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold">User Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-2 font-semibold">Basic Information</h3>
            <p>Email: {user.email}</p>
            <p>Name: {profile?.full_name}</p>
            <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
            <p>
              Last Active:{' '}
              {profile?.last_active_at
                ? new Date(profile.last_active_at).toLocaleDateString()
                : 'Never'}
            </p>
            <p>Status: {profile?.subscription_status || 'No subscription'}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Permissions</h3>
            <div className="space-y-1">
              {user.permissions?.map(permission => (
                <div key={permission.id} className="text-sm">
                  {permission.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
