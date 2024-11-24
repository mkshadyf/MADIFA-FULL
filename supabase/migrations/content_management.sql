-- Content Tags
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  type VARCHAR NOT NULL CHECK (type IN ('genre', 'mood', 'theme', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Content Series
CREATE TABLE content_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Content Episodes
CREATE TABLE content_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES content_series(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(series_id, season_number, episode_number)
);

-- Content Tags Junction
CREATE TABLE content_tags_junction (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (content_id, tag_id)
);

-- User Content Interactions
CREATE TABLE user_content_interactions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  favorite BOOLEAN DEFAULT false,
  watchlist BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  progress FLOAT CHECK (progress >= 0 AND progress <= 1),
  last_watched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, content_id)
);

-- Add metadata columns to content table
ALTER TABLE content ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE content ADD COLUMN tags UUID[] DEFAULT ARRAY[]::UUID[];
ALTER TABLE content ADD COLUMN series_id UUID REFERENCES content_series(id);
ALTER TABLE content ADD COLUMN season_number INTEGER;
ALTER TABLE content ADD COLUMN episode_number INTEGER;

-- Create indexes for better query performance
CREATE INDEX idx_content_tags_type ON content_tags(type);
CREATE INDEX idx_content_episodes_series ON content_episodes(series_id);
CREATE INDEX idx_user_interactions_user ON user_content_interactions(user_id);
CREATE INDEX idx_user_interactions_content ON user_content_interactions(content_id);
CREATE INDEX idx_content_series ON content(series_id);

-- Functions for content recommendations
CREATE OR REPLACE FUNCTION get_user_recommendations(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  content_id UUID,
  score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      t.type,
      t.id AS tag_id,
      COUNT(*) as preference_count
    FROM user_content_interactions ui
    JOIN content c ON ui.content_id = c.id
    JOIN content_tags_junction tj ON c.id = tj.content_id
    JOIN content_tags t ON tj.tag_id = t.id
    WHERE ui.user_id = p_user_id
    AND (ui.favorite = true OR ui.rating >= 4)
    GROUP BY t.type, t.id
  )
  SELECT 
    c.id as content_id,
    SUM(CASE 
      WHEN up.tag_id IS NOT NULL THEN up.preference_count
      ELSE 0
    END)::float / COUNT(t.id) as score
  FROM content c
  JOIN content_tags_junction tj ON c.id = tj.content_id
  JOIN content_tags t ON tj.tag_id = t.id
  LEFT JOIN user_preferences up ON t.id = up.tag_id
  WHERE c.id NOT IN (
    SELECT content_id 
    FROM user_content_interactions 
    WHERE user_id = p_user_id
  )
  GROUP BY c.id
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function for advanced search
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  tags UUID[] DEFAULT NULL,
  min_rating FLOAT DEFAULT NULL,
  series_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  thumbnail_url VARCHAR,
  avg_rating FLOAT,
  match_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.thumbnail_url,
    COALESCE(AVG(ui.rating), 0) as avg_rating,
    ts_rank(
      to_tsvector('english', c.title || ' ' || c.description),
      to_tsquery('english', search_query)
    ) as match_score
  FROM content c
  LEFT JOIN user_content_interactions ui ON c.id = ui.content_id
  WHERE 
    (search_query IS NULL OR 
     to_tsvector('english', c.title || ' ' || c.description) @@ to_tsquery('english', search_query))
    AND (tags IS NULL OR c.tags && tags)
    AND (min_rating IS NULL OR 
         c.id IN (SELECT content_id FROM user_content_interactions GROUP BY content_id HAVING AVG(rating) >= min_rating))
    AND (NOT series_only OR c.series_id IS NOT NULL)
  GROUP BY c.id, c.title, c.description, c.thumbnail_url
  ORDER BY match_score DESC, avg_rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql; 