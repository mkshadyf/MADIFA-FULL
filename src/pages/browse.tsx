import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import type { Content } from '@/types/content';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Browse() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .limit(10);

        if (error) {
          throw error;
        }

        setContent(data || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch content';
        setError(errorMessage);
        sentryService.captureException(err as Error, {
          context: 'Browse page',
          extra: { location: 'fetchContent' }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
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
      <div className="flex h-full flex-col items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Error loading content</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Browse Content</h1>
      
      {content.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium text-gray-600">No content available</h2>
          <p className="text-gray-500">Check back later for new content updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {content.map((item) => (
            <div 
              key={item.id} 
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full bg-gray-100">
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No thumbnail</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-lg font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {item.description || 'No description available'}
                </p>
                <Link
                  to={`/content/${item.id}`}
                  className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
