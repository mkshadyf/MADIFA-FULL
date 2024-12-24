import { supabase } from '@/lib/supabase/client'
import { createAPIError, createErrorContext } from '@/lib/utils/error-handler'
import type { Permission } from '@/types/user'

export type { Permission }

export interface RolePermission {
  role: string
  permissions: Permission[]
}

export class PermissionService {
  async getRolePermissions(role: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', role)
        .single()

      if (error) throw error
      return data.permissions
    } catch (error) {
      throw createAPIError(
        'Failed to get role permissions',
        'GET_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'getRolePermissions', { role, error })
      )
    }
  }

  async updateRolePermissions(rolePermission: RolePermission): Promise<void> {
    try {
      const { error } = await supabase.from('role_permissions').upsert({
        role: rolePermission.role,
        permissions: rolePermission.permissions,
      })

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        'Failed to update role permissions',
        'UPDATE_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'updateRolePermissions', { rolePermission, error })
      )
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      // Get user's role first
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (userError) throw userError

      // Get role permissions
      const rolePermissions = await this.getRolePermissions(userProfile.role)

      // Get any additional custom permissions for the user
      const { data: customPermissions, error: customError } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .single()

      if (customError && customError.code !== 'PGRST116') {
        // Ignore not found error
        throw customError
      }

      // Combine and deduplicate permissions
      const allPermissions = [
        ...rolePermissions,
        ...(customPermissions?.permissions || []),
      ]

      return Array.from(
        new Set(allPermissions.map(p => JSON.stringify(p)))
      ).map(p => JSON.parse(p))
    } catch (error) {
      throw createAPIError(
        'Failed to get user permissions',
        'GET_USER_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'getUserPermissions', { userId, error })
      )
    }
  }

  async updateUserPermissions(
    userId: string,
    permissions: Permission[]
  ): Promise<void> {
    try {
      const { error } = await supabase.from('user_permissions').upsert({
        user_id: userId,
        permissions,
      })

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        'Failed to update user permissions',
        'UPDATE_USER_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'updateUserPermissions', { userId, permissions, error })
      )
    }
  }

  async removeUserPermissions(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        'Failed to remove user permissions',
        'REMOVE_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'removeUserPermissions', { userId, error })
      )
    }
  }

  async getAvailablePermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        'Failed to get available permissions',
        'GET_AVAILABLE_PERMISSIONS_ERROR',
        createErrorContext('permissions', 'getAvailablePermissions', { error })
      )
    }
  }

  async createPermission(
    permission: Omit<Permission, 'id'>
  ): Promise<Permission> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .insert({
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        'Failed to create permission',
        'CREATE_PERMISSION_ERROR',
        createErrorContext('permissions', 'createPermission', { permission, error })
      )
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        'Failed to delete permission',
        'DELETE_PERMISSION_ERROR',
        createErrorContext('permissions', 'deletePermission', { permissionId, error })
      )
    }
  }
}

export const permissionService = new PermissionService()

// Export individual functions for convenience
export const {
  getRolePermissions,
  updateRolePermissions,
  getUserPermissions,
  updateUserPermissions,
  removeUserPermissions,
  getAvailablePermissions,
  createPermission,
  deletePermission
} = permissionService
