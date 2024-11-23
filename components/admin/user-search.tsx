'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UserSearchProps {
  onSelect?: (user: UserProfile) => void
}

export default function UserSearch({ onSelect }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchUsers()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, subscriptionFilter])

  const searchUsers = async () => {
    setLoading(true)
    try {
      let queryBuilder = supabase
        .from('user_profiles')
        .select('*')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (subscriptionFilter !== 'all') {
        queryBuilder = queryBuilder.eq('subscription_tier', subscriptionFilter)
      }

      const { data, error } = await queryBuilder

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="premium_plus">Premium Plus</option>
        </select>
      </div>

      {loading && (
        <div className="text-center text-gray-400 py-4">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-700">
            {results.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-750 cursor-pointer"
                onClick={() => onSelect?.(user)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                      {user.full_name[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{user.full_name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.subscription_tier}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          No users found
        </div>
      )}
    </div>
  )
} 