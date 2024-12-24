import { env } from '@/lib/config/env';
import type { Database } from '@/lib/supabase/types';
import type { ErrorContext } from '@/lib/utils/error-handler';
import { createErrorContext } from '@/lib/utils/error-handler';
import type { BaseError } from '@/types';
import { createClient } from '@supabase/supabase-js';

export interface SupabaseError extends BaseError {
  code: string;
  details: unknown;
  hint?: string;
}

export const isSupabaseError = (error: unknown): error is SupabaseError => {
  return error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'details' in error;
};

export const handleSupabaseError = (error: unknown, context: ErrorContext): SupabaseError => {
  if (isSupabaseError(error)) {
    return {
      ...error,
      details: context
    };
  }

  return {

    code: '500',
    message: error instanceof Error ? error.message : 'Database operation failed',
    name: 'SupabaseError',
    details: context
  };
};

export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export class SupabaseService {
  private handleError(error: unknown, operation: string, details?: unknown): SupabaseError {
    const context = createErrorContext('SupabaseService', operation, details);
    return handleSupabaseError(error, context);
  }

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error, 'getProfile', { userId });
    }
  }

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error, 'updateProfile', { userId, updates });
    }
  }

  async getSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_id: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error, 'getSubscription', { userId });
    }
  }

  async getWatchHistory(userId: string, limit?: number) {
    try {
      const { data, error } = await supabase
        .rpc('get_watch_history', { user_id: userId, limit });

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error, 'getWatchHistory', { userId, limit });
    }
  }

  async updateWatchProgress(userId: string, videoId: string, progress: number, completed: boolean) {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: userId,
          video_id: videoId,
          progress,
          completed,
          watched_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error, 'updateWatchProgress', { userId, videoId, progress, completed });
    }
  }
}

export const supabaseService = new SupabaseService(); 