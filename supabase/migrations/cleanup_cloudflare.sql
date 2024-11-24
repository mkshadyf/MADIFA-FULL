-- Remove Cloudflare-specific columns
ALTER TABLE content 
  DROP COLUMN IF EXISTS cloudflare_id,
  DROP COLUMN IF EXISTS cloudflare_status,
  ADD COLUMN IF NOT EXISTS vimeo_id TEXT,
  ADD COLUMN IF NOT EXISTS vimeo_privacy JSONB,
  ADD COLUMN IF NOT EXISTS vimeo_status TEXT;

-- Update watch history table
ALTER TABLE watch_history
  DROP COLUMN IF EXISTS cloudflare_progress,
  ADD COLUMN IF NOT EXISTS vimeo_progress FLOAT; 