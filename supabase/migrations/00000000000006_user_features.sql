-- Create user lists table (watchlist, favorites, etc)
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL CHECK (list_type IN ('watchlist', 'favorites')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, content_id, list_type)
);

-- Create user ratings table
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, content_id)
);

-- Create user preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories TEXT[],
  preferred_languages TEXT[],
  content_filters JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_lists_user ON user_lists(user_id);
CREATE INDEX idx_user_lists_content ON user_lists(content_id);
CREATE INDEX idx_user_lists_type ON user_lists(list_type);
CREATE INDEX idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_content ON user_ratings(content_id);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own lists"
  ON user_lists
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings"
  ON user_ratings
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_content_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating in content table
  WITH avg_rating AS (
    SELECT AVG(rating)::NUMERIC(2,1) as average
    FROM user_ratings
    WHERE content_id = NEW.content_id
  )
  UPDATE content
  SET 
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{average_rating}',
      to_jsonb(avg_rating.average)
    )
  FROM avg_rating
  WHERE id = NEW.content_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_content_rating(); 