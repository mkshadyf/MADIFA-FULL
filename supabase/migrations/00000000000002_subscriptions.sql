-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'past_due',
  'incomplete',
  'incomplete_expired'
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription sync jobs
CREATE TABLE subscription_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription error logs
CREATE TABLE subscription_error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES subscription_sync_jobs(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_sync_jobs_user ON subscription_sync_jobs(user_id);
CREATE INDEX idx_sync_jobs_subscription ON subscription_sync_jobs(subscription_id);
CREATE INDEX idx_sync_jobs_status ON subscription_sync_jobs(status);
CREATE INDEX idx_error_logs_job ON subscription_error_logs(job_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync jobs"
  ON subscription_sync_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_subscription_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Create sync job when subscription status changes
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) OR TG_OP = 'INSERT' THEN
    INSERT INTO subscription_sync_jobs (
      user_id,
      subscription_id,
      status
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_subscription_updated
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE handle_subscription_updated(); 