-- Create watch history table
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  progress FLOAT CHECK (progress >= 0 AND progress <= 1),
  watched_duration INTEGER,
  completed BOOLEAN DEFAULT false,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, content_id)
);

-- Create watch sessions table for detailed analytics
CREATE TABLE watch_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  device_info JSONB,
  quality_switches INTEGER DEFAULT 0,
  buffering_events INTEGER DEFAULT 0,
  average_bitrate INTEGER,
  ip_address INET,
  country_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_content ON watch_history(content_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(last_watched DESC);
CREATE INDEX idx_watch_sessions_user ON watch_sessions(user_id);
CREATE INDEX idx_watch_sessions_content ON watch_sessions(content_id);
CREATE INDEX idx_watch_sessions_start ON watch_sessions(start_time DESC);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own watch history"
  ON watch_history
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watch sessions"
  ON watch_sessions
  USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_watch_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update content view count
  UPDATE content
  SET 
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{view_count}',
      to_jsonb(COALESCE((metadata->>'view_count')::integer, 0) + 1)
    )
  WHERE id = NEW.content_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_watch_session_complete
  AFTER INSERT ON watch_sessions
  FOR EACH ROW
  WHEN (NEW.end_time IS NOT NULL)
  EXECUTE FUNCTION update_watch_stats(); 