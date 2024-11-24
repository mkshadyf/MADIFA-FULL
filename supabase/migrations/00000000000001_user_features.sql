-- User Content Interactions
CREATE TABLE user_content_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  favorite BOOLEAN DEFAULT false,
  watchlist BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  progress FLOAT DEFAULT 0,
  last_watched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Viewing History
CREATE TABLE viewing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  progress FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  pin_code TEXT,
  parental_controls JSONB DEFAULT '{
    "enabled": false,
    "max_rating": "PG-13",
    "pin": null
  }'::jsonb,
  preferences JSONB DEFAULT '{
    "autoplay": true,
    "default_quality": "1080p",
    "subtitle_language": "en",
    "audio_language": "en"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_user_interactions_user ON user_content_interactions(user_id);
CREATE INDEX idx_user_interactions_content ON user_content_interactions(content_id);
CREATE INDEX idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX idx_viewing_history_content ON viewing_history(content_id);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id); 