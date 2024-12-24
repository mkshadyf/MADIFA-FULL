import type { export Content } from '@/types';
import type { User } from '@/types/auth';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';
export type VideoStatus = 'processing' | 'ready' | 'error';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>>;
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['user_profiles']['Row'], 'id'>>;
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          vimeo_id: string;
          thumbnail_url: string | null;
          duration: number;
          status: VideoStatus;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
          category: string | null;
          tags: string[];
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: VideoStatus };
        Update: Partial<Omit<Database['public']['Tables']['videos']['Row'], 'id'>>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          tier: SubscriptionTier;
          current_period_start: string;
          current_period_end: string;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Row'], 'id'>>;
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          watched_at: string;
          progress: number;
          completed: boolean;
        };
        Insert: Omit<Database['public']['Tables']['watch_history']['Row'], 'id' | 'watched_at'>;
        Update: Partial<Omit<Database['public']['Tables']['watch_history']['Row'], 'id'>>;
      };
    };
    Views: {
      user_subscriptions: {
        Row: {
          user_id: string;
          subscription_id: string;
          status: SubscriptionStatus;
          tier: SubscriptionTier;
          current_period_end: string;
        };
      };
      active_subscriptions: {
        Row: {
          user_id: string;
          subscription_id: string;
          tier: SubscriptionTier;
          days_remaining: number;
        };
      };
    };
    Functions: {
      get_user_subscription: {
        Args: { user_id: string };
        Returns: Database['public']['Views']['user_subscriptions']['Row'];
      };
      get_watch_history: {
        Args: { user_id: string; limit?: number };
        Returns: Array<Database['public']['Tables']['watch_history']['Row'] & { video: Content }>;
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type Functions = Database['public']['Functions'];

export type UserProfile = Tables['user_profiles']['Row'];
export type Video = Tables['videos']['Row'];
export type Subscription = Tables['subscriptions']['Row'];
export type WatchHistory = Tables['watch_history']['Row'];

export type UserSubscriptionView = Views['user_subscriptions']['Row'];
export type ActiveSubscriptionView = Views['active_subscriptions']['Row'];
