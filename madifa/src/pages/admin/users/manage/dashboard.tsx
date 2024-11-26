

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import UsersList from '@/components/admin/users-list'
import type { Database } from '@/lib/supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  subscriptionTiers: {
    free: number
    premium: number
    premium_plus: number
  }
  subscriptionStatus: {
    active: number
    inactive: number
    past_due: number
  }
  recentSignups: UserProfile[]
}

export default function UserManagementDashboard() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })

        // Get active users (active in last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const { count: activeUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Get subscription stats
        const { data: subscriptions } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_status')

        const subscriptionTiers = {
          free: 0,
          premium: 0,
          premium_plus: 0
        }

        const subscriptionStatus = {
          active: 0,
          inactive: 0,
          past_due: 0
        }

        subscriptions?.forEach(sub => {
          if (sub.subscription_tier in subscriptionTiers) {
            subscriptionTiers[sub.subscription_tier as keyof typeof subscriptionTiers]++
          }
          if (sub.subscription_status in subscriptionStatus) {
            subscriptionStatus[sub.subscription_status as keyof typeof subscriptionStatus]++
          }
        })

        // Get recent signups
        const { data: recentSignups } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setMetrics({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          subscriptionTiers,
          subscriptionStatus,
          recentSignups: recentSignups || []
        })
      } catch (error) {
        console.error('Error fetching user metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.totalUsers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.activeUsers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Premium Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.subscriptionTiers.premium + metrics?.subscriptionTiers.premium_plus}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Past Due</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.subscriptionStatus.past_due}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Subscription Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Free</span>
              <span className="text-white font-medium">{metrics?.subscriptionTiers.free}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Premium</span>
              <span className="text-white font-medium">{metrics?.subscriptionTiers.premium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Premium Plus</span>
              <span className="text-white font-medium">{metrics?.subscriptionTiers.premium_plus}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Recent Signups</h3>
          <div className="space-y-4">
            {metrics?.recentSignups.map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">User List</h2>
        <UsersList users={metrics?.recentSignups || []} onRefresh={() => {}} />
      </div>
    </div>
  )
} 
