-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'viewer', 'moderator');

-- Create user profiles with roles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'viewer',
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  creator_status TEXT CHECK (creator_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create creator profiles for content producers
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  business_email TEXT,
  phone TEXT,
  address JSONB,
  tax_info JSONB,
  vimeo_account_id TEXT,
  vimeo_access_token TEXT,
  payment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create content sources table
CREATE TABLE content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('vimeo', 'youtube', 'direct')),
  external_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_content_sources_creator_id ON content_sources(creator_id); 