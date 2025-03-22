import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define proper types for our PWA with full mobile support
interface ContentDetails {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  category?: string;
  duration?: number;
}

interface RecentContentItem {
  content_id: string;
  viewed_at: string;
  contents: ContentDetails;
}

interface FavoriteContentItem {
  content_id: string;
  favorited_at: string;
  contents: ContentDetails;
}

interface DownloadedContentItem {
  content_id: string;
  downloaded_at: string;
  contents: ContentDetails;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  subscription_status?: string;
  created_at: string;
}

interface DashboardStats {
  recentContent: RecentContentItem[];
  favoriteContent: FavoriteContentItem[];
  downloadedContent: DownloadedContentItem[];
  userProfile: UserProfile | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    recentContent: [],
    favoriteContent: [],
    downloadedContent: [],
    userProfile: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Get recent content
      const { data: recentContent, error: recentError } = await supabase
        .from('content_views')
        .select('content_id, viewed_at, contents(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);
        
      if (recentError) throw recentError;
      
      // Get favorite content
      const { data: favoriteContent, error: favError } = await supabase
        .from('favorites')
        .select('content_id, favorited_at, contents(*)')
        .eq('user_id', user.id)
        .order('favorited_at', { ascending: false })
        .limit(5);
        
      if (favError) throw favError;
      
      // Get downloaded content
      const { data: downloadedContent, error: dlError } = await supabase
        .from('downloads')
        .select('content_id, downloaded_at, contents(*)')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(5);
        
      if (dlError) throw dlError;
      
      setStats({
        userProfile: profile,
        recentContent: (recentContent as unknown) as RecentContentItem[] || [],
        favoriteContent: (favoriteContent as unknown) as FavoriteContentItem[] || [],
        downloadedContent: (downloadedContent as unknown) as DownloadedContentItem[] || [],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      sentryService.captureException(err as Error, {
        context: 'Dashboard page',
        extra: { location: 'fetchDashboardData' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center">
        <h2 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
      
      {/* User Profile Summary */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Welcome Back, {stats.userProfile?.full_name || 'User'}!</h2>
        <p className="text-gray-600">
          {stats.userProfile?.subscription_status === 'active' 
            ? 'You have an active subscription.' 
            : 'You do not have an active subscription.'}
        </p>
        {stats.userProfile?.subscription_status !== 'active' && (
          <Link to="/subscription" className="mt-2 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Subscribe Now
          </Link>
        )}
      </div>
      
      {/* Recent Content */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Recently Viewed</h2>
        {stats.recentContent.length === 0 ? (
          <p className="text-gray-600">You haven't viewed any content yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {stats.recentContent.map((item) => (
              <div key={item.content_id} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="aspect-video bg-gray-200">
                  {/* Thumbnail image */}
                </div>
                <div className="p-3">
                  <h3 className="mb-1 text-sm font-medium line-clamp-1">
                    {item.contents?.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Viewed: {new Date(item.viewed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Favorite Content */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Favorites</h2>
        {stats.favoriteContent.length === 0 ? (
          <p className="text-gray-600">You haven't favorited any content yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {stats.favoriteContent.map((item) => (
              <div key={item.content_id} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="aspect-video bg-gray-200">
                  {/* Thumbnail image */}
                </div>
                <div className="p-3">
                  <h3 className="mb-1 text-sm font-medium line-clamp-1">
                    {item.contents?.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Added: {new Date(item.favorited_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Downloaded Content */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Downloads</h2>
        {stats.downloadedContent.length === 0 ? (
          <p className="text-gray-600">You haven't downloaded any content yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {stats.downloadedContent.map((item) => (
              <div key={item.content_id} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="aspect-video bg-gray-200">
                  {/* Thumbnail image */}
                </div>
                <div className="p-3">
                  <h3 className="mb-1 text-sm font-medium line-clamp-1">
                    {item.contents?.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Downloaded: {new Date(item.downloaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
