import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  release_year: number;
  created_at: string;
  updated_at: string;
}

export function useContent(id?: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      if (!id) throw new Error('Content ID is required')
      const response = await fetch(`/api/content/${id}`)
      if (!response.ok) throw new Error('Failed to fetch content')
      return response.json()
    },
    enabled: !!id,
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to search content')
      return response.json()
    },
    enabled: !!query,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData
  })
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      fetchFavorites();
    }
  }, [profile]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', profile?.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch favorites'));
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (content: Content) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ ...content, user_id: profile?.id }]);

      if (error) throw error;
      setFavorites([...favorites, content]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add to favorites'));
      throw err;
    }
  };

  const removeFromFavorites = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', contentId)
        .eq('user_id', profile?.id);

      if (error) throw error;
      setFavorites(favorites.filter(fav => fav.id !== contentId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove from favorites'));
      throw err;
    }
  };

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites
  };
}