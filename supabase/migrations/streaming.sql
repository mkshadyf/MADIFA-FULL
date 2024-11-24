-- Streaming related tables
CREATE TABLE streaming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  quality VARCHAR NOT NULL,
  format VARCHAR NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  bytes_transferred BIGINT DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  client_info JSONB
);

CREATE TABLE transcoding_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress FLOAT DEFAULT 0,
  qualities VARCHAR[] NOT NULL,
  source_url TEXT NOT NULL,
  outputs JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE cdn_cache_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  quality VARCHAR NOT NULL,
  region VARCHAR NOT NULL,
  cached BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE,
  hit_count INTEGER DEFAULT 0,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_streaming_sessions_user ON streaming_sessions(user_id);
CREATE INDEX idx_streaming_sessions_content ON streaming_sessions(content_id);
CREATE INDEX idx_transcoding_jobs_content ON transcoding_jobs(content_id);
CREATE INDEX idx_transcoding_jobs_status ON transcoding_jobs(status);
CREATE INDEX idx_cdn_cache_status_content ON cdn_cache_status(content_id);
CREATE INDEX idx_cdn_cache_status_region ON cdn_cache_status(region);

-- Functions
CREATE OR REPLACE FUNCTION update_cdn_cache_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cdn_cache_status
  SET 
    hit_count = hit_count + 1,
    last_accessed = NOW(),
    updated_at = NOW()
  WHERE 
    content_id = NEW.content_id 
    AND quality = NEW.quality
    AND region = NEW.region;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating cache status
CREATE TRIGGER trigger_update_cdn_cache_status
AFTER INSERT ON streaming_sessions
FOR EACH ROW
EXECUTE FUNCTION update_cdn_cache_status(); 