-- Create viewing history
CREATE TABLE viewing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  progress FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create watchlist
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX idx_viewing_history_content ON viewing_history(content_id);
CREATE INDEX idx_viewing_history_episode ON viewing_history(episode_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_content ON favorites(content_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_content ON watchlist(content_id); 