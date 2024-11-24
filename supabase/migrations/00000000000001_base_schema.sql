-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create content types enum
CREATE TYPE content_type AS ENUM ('movie', 'series', 'music');

-- Create content table (minimal, just what we need to organize)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_id TEXT NOT NULL UNIQUE,
  type content_type NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  custom_tags TEXT[], -- For our own categorization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create series episodes mapping
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  vimeo_id TEXT NOT NULL UNIQUE,
  episode_number INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(content_id, season_number, episode_number)
);

-- Create user profiles (minimal)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_published ON content(is_published);
CREATE INDEX idx_episodes_content ON episodes(content_id);
CREATE INDEX idx_episodes_season ON episodes(season_number);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_content ON purchases(content_id); 