-- Create function to handle subscription changes
CREATE OR REPLACE FUNCTION handle_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert sync job
  INSERT INTO subscription_sync_jobs (
    subscription_id,
    user_id,
    action,
    status,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    CASE
      WHEN NEW.status = 'active' THEN 'grant'
      ELSE 'revoke'
    END,
    'pending',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription changes
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE OF status
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_change();

-- Create subscription sync jobs table
CREATE TABLE IF NOT EXISTS subscription_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  action TEXT CHECK (action IN ('grant', 'revoke')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for pending jobs
CREATE INDEX idx_pending_sync_jobs ON subscription_sync_jobs(status) 
WHERE status = 'pending'; 