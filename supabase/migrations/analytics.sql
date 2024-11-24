-- Content Analytics Tables
CREATE TABLE content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  watch_duration INTEGER NOT NULL,
  completion_rate FLOAT,
  quality VARCHAR,
  platform VARCHAR,
  device_type VARCHAR,
  region VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR NOT NULL CHECK (action_type IN ('like', 'share', 'comment', 'rate')),
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  average_completion_rate FLOAT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_content_views_content ON content_views(content_id);
CREATE INDEX idx_content_views_user ON content_views(user_id);
CREATE INDEX idx_content_views_date ON content_views(created_at);
CREATE INDEX idx_content_engagement_content ON content_engagement(content_id);
CREATE INDEX idx_content_engagement_user ON content_engagement(user_id);
CREATE INDEX idx_content_performance_content ON content_performance(content_id);
CREATE INDEX idx_content_performance_date ON content_performance(date);

-- Functions
CREATE OR REPLACE FUNCTION update_content_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily performance metrics
  INSERT INTO content_performance (
    content_id,
    views_count,
    unique_viewers,
    total_watch_time,
    average_completion_rate,
    date
  )
  SELECT
    NEW.content_id,
    COUNT(*),
    COUNT(DISTINCT user_id),
    SUM(watch_duration),
    AVG(completion_rate),
    DATE(NEW.created_at)
  FROM content_views
  WHERE content_id = NEW.content_id
    AND DATE(created_at) = DATE(NEW.created_at)
  GROUP BY content_id, DATE(created_at)
  ON CONFLICT (content_id, date)
  DO UPDATE SET
    views_count = EXCLUDED.views_count,
    unique_viewers = EXCLUDED.unique_viewers,
    total_watch_time = EXCLUDED.total_watch_time,
    average_completion_rate = EXCLUDED.average_completion_rate,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_content_performance
AFTER INSERT ON content_views
FOR EACH ROW
EXECUTE FUNCTION update_content_performance();

-- Views
CREATE VIEW content_analytics AS
SELECT
  c.id,
  c.title,
  cp.views_count,
  cp.unique_viewers,
  cp.total_watch_time,
  cp.average_completion_rate,
  cp.engagement_rate,
  cp.likes_count,
  cp.shares_count,
  cp.date
FROM content c
LEFT JOIN content_performance cp ON c.id = cp.content_id
WHERE cp.date >= CURRENT_DATE - INTERVAL '30 days';

-- Functions for analytics queries
CREATE OR REPLACE FUNCTION get_content_trends(
  p_content_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  views INTEGER,
  watch_time INTEGER,
  completion_rate FLOAT,
  engagement_rate FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.date,
    cp.views_count,
    cp.total_watch_time,
    cp.average_completion_rate,
    cp.engagement_rate
  FROM content_performance cp
  WHERE cp.content_id = p_content_id
    AND cp.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  ORDER BY cp.date;
END;
$$ LANGUAGE plpgsql; 