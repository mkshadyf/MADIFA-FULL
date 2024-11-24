-- Create table for Vimeo sync status
CREATE TABLE vimeo_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_id TEXT NOT NULL UNIQUE,
  last_synced TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  status TEXT CHECK (status IN ('synced', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_vimeo_sync_status ON vimeo_sync(status);
CREATE INDEX idx_vimeo_sync_last_synced ON vimeo_sync(last_synced);

-- Create sync log table
CREATE TABLE vimeo_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add index
CREATE INDEX idx_vimeo_sync_log_vimeo_id ON vimeo_sync_log(vimeo_id); 