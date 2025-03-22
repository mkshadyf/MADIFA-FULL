import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalContent: number;
  activeSubscriptions: number;
  recentLogins: Array<{
    id: string;
    email: string;
    last_sign_in_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalContent: 0,
    activeSubscriptions: 0,
    recentLogins: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (userError) throw userError;
        
        // Get total content
        const { count: contentCount, error: contentError } = await supabase
          .from('contents')
          .select('*', { count: 'exact', head: true });
          
        if (contentError) throw contentError;
        
        // Get active subscriptions
        const { count: subCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        if (subError) throw subError;
        
        // Get recent logins
        const { data: recentLogins, error: loginError } = await supabase
          .from('auth.users')
          .select('id, email, last_sign_in_at')
          .order('last_sign_in_at', { ascending: false })
          .limit(10);
          
        if (loginError) throw loginError;
        
        setStats({
          totalUsers: userCount || 0,
          totalContent: contentCount || 0,
          activeSubscriptions: subCount || 0,
          recentLogins: recentLogins || [],
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load admin stats';
        setError(errorMessage);
        sentryService.captureException(err as Error, {
          context: 'Admin Dashboard page',
          extra: { location: 'fetchStats' }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
        <h2 className="mb-2 text-lg font-semibold text-red-800">Error loading admin dashboard</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-1 text-3xl font-semibold">{stats.totalUsers}</div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-gray-500">Total Content</div>
          <div className="mt-1 text-3xl font-semibold">{stats.totalContent}</div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-gray-500">Active Subscriptions</div>
          <div className="mt-1 text-3xl font-semibold">{stats.activeSubscriptions}</div>
        </div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Recent User Activity</h2>
        
        {stats.recentLogins.length === 0 ? (
          <p className="text-gray-500">No recent logins</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stats.recentLogins.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {new Date(user.last_sign_in_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
