-- User preferences and settings
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{
  "enabled": false,
  "pin": null,
  "maxRating": "PG-13",
  "restrictedCategories": []
}'::jsonb;

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, content_id)
);

-- Viewing history with additional metadata
CREATE TABLE IF NOT EXISTS viewing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  progress FLOAT NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  watch_count INTEGER DEFAULT 1,
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content ON user_favorites(content_id);
CREATE INDEX idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX idx_viewing_history_content ON viewing_history(content_id);
CREATE INDEX idx_viewing_history_last_watched ON viewing_history(last_watched);

-- Functions for cleanup and maintenance
CREATE OR REPLACE FUNCTION cleanup_viewing_history()
RETURNS void AS $$
BEGIN
  -- Keep only last 100 entries per user
  WITH ranked_history AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY last_watched DESC) as rn
    FROM viewing_history
  )
  DELETE FROM viewing_history
  WHERE id IN (
    SELECT id FROM ranked_history WHERE rn > 100
  );
END;
$$ LANGUAGE plpgsql; 