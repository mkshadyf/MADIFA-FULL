import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { usePermissions } from '@/hooks/usePermissions'
import { permissionService, type Permission } from '@/lib/services/permissions'

interface PermissionManagerProps {
  userId?: string // If provided, manage specific user permissions
  role?: string // If provided, manage role permissions
}

export function PermissionManager({ userId, role }: PermissionManagerProps) {
  const { isAdmin } = usePermissions()
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([])
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadPermissions()
  }, [userId, role])

  const loadPermissions = async () => {
    try {
      setIsLoading(true)
      const [available, current] = await Promise.all([
        permissionService.getAvailablePermissions(),
        userId
          ? permissionService.getUserPermissions(userId)
          : role
            ? permissionService.getRolePermissions(role)
            : Promise.resolve([]),
      ])

      setAvailablePermissions(available)
      setSelectedPermissions(current)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev => {
      const exists = prev.some(p => p.id === permission.id)
      if (exists) {
        return prev.filter(p => p.id !== permission.id)
      } else {
        return [...prev, permission]
      }
    })
  }

  const handleSave = async () => {
    try {
      if (userId) {
        await permissionService.updateUserPermissions(
          userId,
          selectedPermissions
        )
      } else if (role) {
        await permissionService.updateRolePermissions({
          role,
          permissions: selectedPermissions,
        })
      }
      toast.success('Permissions updated successfully')
    } catch (error) {
      console.error('Failed to update permissions:', error)
      toast.error('Failed to update permissions')
    }
  }

  if (!isAdmin) {
    return <div>You do not have permission to manage permissions</div>
  }

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {userId
            ? 'User Permissions'
            : role
              ? `${role} Role Permissions`
              : 'Permissions'}
        </h2>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availablePermissions.map(permission => (
          <div
            key={permission.id}
            className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
            onClick={() => handlePermissionToggle(permission)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{permission.name}</h3>
                <p className="text-sm text-gray-500">
                  {permission.description}
                </p>
              </div>
              <input
                aria-label={permission.name}
                type="checkbox"
                checked={selectedPermissions.some(p => p.id === permission.id)}
                onChange={() => handlePermissionToggle(permission)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                {permission.resource}
              </span>
              <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {permission.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
