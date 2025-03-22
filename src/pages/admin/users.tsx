import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { SubscriptionStatus } from '@/types/subscription';

interface Subscription {
  status: SubscriptionStatus;
  provider: 'stripe' | 'payfast';
  reference?: string;
}

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name?: string;
  subscription?: Subscription;
  subscription_status?: SubscriptionStatus;
};

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name?: string;
  subscription?: {
    status: SubscriptionStatus;
    provider: 'stripe' | 'payfast';
    reference?: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, created_at, last_sign_in_at, full_name, subscription:subscriptions(status, provider, reference)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Use a type assertion to handle the Supabase response structure
        const formattedUsers = (data as unknown as SupabaseUser[])?.map((user) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          full_name: user.full_name,
          subscription: user.subscription,
          subscription_status: user.subscription?.status,
        })) || [];
        
        setUsers(formattedUsers);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
        setError(errorMessage);
        sentryService.captureException(err as Error, {
          context: 'User Management page',
          extra: { location: 'fetchUsers' }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-800">Error loading users</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Subscription
              </th>
              <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Joined
              </th>
              <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Active
              </th>
              <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    {user.full_name && (
                      <div className="text-sm text-gray-500">{user.full_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.subscription_status === 'trialing'
                          ? 'bg-blue-100 text-blue-800'
                          : user.subscription_status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : user.subscription_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : user.subscription_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.subscription_status || 'none'}
                      {user.subscription?.provider && (
                        <span className="ml-1 opacity-75">({user.subscription.provider})</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button className="text-red-600 hover:text-red-900">Disable</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
