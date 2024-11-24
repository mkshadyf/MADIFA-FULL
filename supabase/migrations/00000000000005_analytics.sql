-- Create analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create view statistics table
CREATE TABLE view_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  average_watch_time INTEGER DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(content_id, date)
);

-- Create indexes
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_content ON analytics_events(content_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_view_statistics_content ON view_statistics(content_id);
CREATE INDEX idx_view_statistics_date ON view_statistics(date);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Admin users can view all analytics"
  ON analytics_events
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_view_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO view_statistics (content_id, date, views)
  VALUES (NEW.content_id, CURRENT_DATE, 1)
  ON CONFLICT (content_id, date)
  DO UPDATE SET
    views = view_statistics.views + 1,
    updated_at = TIMEZONE('utc', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_view_recorded
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'view')
  EXECUTE FUNCTION update_view_statistics(); 