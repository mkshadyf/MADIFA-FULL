-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription error logs table
CREATE TABLE IF NOT EXISTS subscription_error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES subscription_sync_jobs(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_error_logs_job ON subscription_error_logs(job_id);

-- Add retry count to sync jobs
ALTER TABLE subscription_sync_jobs 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;

-- Add function to handle notification cleanup
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM notifications
  WHERE read = true
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Delete error logs older than 90 days
  DELETE FROM subscription_error_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job for cleanup
SELECT cron.schedule(
  'cleanup-notifications',
  '0 0 * * *', -- Run daily at midnight
  'SELECT cleanup_old_notifications()'
); 