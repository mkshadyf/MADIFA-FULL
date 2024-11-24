-- Create Vimeo sync status enum
CREATE TYPE vimeo_sync_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- Create Vimeo sync jobs table
CREATE TABLE vimeo_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  status vimeo_sync_status DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Vimeo webhooks table
CREATE TABLE vimeo_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  video_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Vimeo metadata cache table
CREATE TABLE vimeo_metadata_cache (
  video_id TEXT PRIMARY KEY,
  metadata JSONB NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes
CREATE INDEX idx_vimeo_sync_jobs_status ON vimeo_sync_jobs(status);
CREATE INDEX idx_vimeo_sync_jobs_content ON vimeo_sync_jobs(content_id);
CREATE INDEX idx_vimeo_webhooks_video ON vimeo_webhooks(video_id);
CREATE INDEX idx_vimeo_webhooks_processed ON vimeo_webhooks(processed);
CREATE INDEX idx_vimeo_metadata_expires ON vimeo_metadata_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE vimeo_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vimeo_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vimeo_metadata_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Admin users can manage Vimeo sync jobs"
  ON vimeo_sync_jobs
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION handle_vimeo_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Update content status based on webhook event
  IF NEW.event_type = 'video.upload.complete' THEN
    UPDATE content
    SET status = 'published',
        published_at = TIMEZONE('utc', NOW())
    WHERE vimeo_id = NEW.video_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_vimeo_webhook_received
  AFTER INSERT ON vimeo_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION handle_vimeo_webhook(); 