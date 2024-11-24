-- User Content Interactions Table
CREATE TABLE user_content_interactions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  favorite BOOLEAN DEFAULT false,
  watchlist BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  last_watched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, content_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_interactions_user_id ON user_content_interactions(user_id);
CREATE INDEX idx_user_interactions_content_id ON user_content_interactions(content_id);
CREATE INDEX idx_user_interactions_favorite ON user_content_interactions(favorite);
CREATE INDEX idx_user_interactions_watchlist ON user_content_interactions(watchlist);
CREATE INDEX idx_user_interactions_rating ON user_content_interactions(rating);

-- Function to get user's favorites
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS TABLE (
  content_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  added_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.thumbnail_url,
    c.category,
    ui.created_at as added_at
  FROM user_content_interactions ui
  JOIN content c ON ui.content_id = c.id
  WHERE ui.user_id = p_user_id AND ui.favorite = true
  ORDER BY ui.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's watchlist
CREATE OR REPLACE FUNCTION get_user_watchlist(p_user_id UUID)
RETURNS TABLE (
  content_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  added_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.thumbnail_url,
    c.category,
    ui.created_at as added_at
  FROM user_content_interactions ui
  JOIN content c ON ui.content_id = c.id
  WHERE ui.user_id = p_user_id AND ui.watchlist = true
  ORDER BY ui.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's ratings
CREATE OR REPLACE FUNCTION get_user_ratings(p_user_id UUID)
RETURNS TABLE (
  content_id UUID,
  title TEXT,
  rating INTEGER,
  rated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    ui.rating,
    ui.updated_at as rated_at
  FROM user_content_interactions ui
  JOIN content c ON ui.content_id = c.id
  WHERE ui.user_id = p_user_id AND ui.rating IS NOT NULL
  ORDER BY ui.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update content average rating
CREATE OR REPLACE FUNCTION update_content_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content
  SET average_rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM user_content_interactions
    WHERE content_id = NEW.content_id
    AND rating IS NOT NULL
  )
  WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_rating
AFTER INSERT OR UPDATE OF rating ON user_content_interactions
FOR EACH ROW
EXECUTE FUNCTION update_content_average_rating(); 