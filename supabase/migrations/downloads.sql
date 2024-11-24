-- Downloads table
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'downloading', 'completed', 'failed')),
  progress FLOAT DEFAULT 0,
  options JSONB NOT NULL,
  local_path TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_downloads_content ON downloads(content_id);
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_status ON downloads(status);

-- Function to clean up old downloads
CREATE OR REPLACE FUNCTION cleanup_old_downloads()
RETURNS void AS $$
BEGIN
  DELETE FROM downloads
  WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON downloads
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to check download limits
CREATE OR REPLACE FUNCTION check_download_limit(user_id UUID)
RETURNS boolean AS $$
DECLARE
  download_count INTEGER;
  max_downloads INTEGER;
  user_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM user_profiles
  WHERE user_id = $1;

  -- Set max downloads based on tier
  max_downloads := CASE user_tier
    WHEN 'premium_plus' THEN 25
    WHEN 'premium' THEN 10
    ELSE 0
  END;

  -- Get current download count
  SELECT COUNT(*) INTO download_count
  FROM downloads
  WHERE user_id = $1
  AND status IN ('pending', 'downloading', 'completed');

  RETURN download_count < max_downloads;
END;
$$ LANGUAGE plpgsql; 