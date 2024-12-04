-- Create subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium')),
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB NOT NULL DEFAULT '[]',
  max_quality TEXT NOT NULL CHECK (max_quality IN ('720p', '1080p', '4k')),
  download_enabled BOOLEAN NOT NULL DEFAULT false,
  ad_free BOOLEAN NOT NULL DEFAULT false,
  stripe_price_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_access_logs table for tracking content access
CREATE TABLE subscription_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download')),
  quality TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription-related columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_access_logs ENABLE ROW LEVEL SECURITY;

-- Plans are readable by all authenticated users
CREATE POLICY "Plans are readable by all users" ON subscription_plans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subscriptions are readable by the user they belong to
CREATE POLICY "Users can read their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Access logs are readable by the user they belong to
CREATE POLICY "Users can read their own access logs" ON subscription_access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create functions for subscription management
CREATE OR REPLACE FUNCTION check_subscription_access(
  user_id UUID,
  content_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  user_subscription subscriptions;
  user_plan subscription_plans;
BEGIN
  -- Get user's active subscription
  SELECT s.* INTO user_subscription
  FROM subscriptions s
  WHERE s.user_id = $1
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  LIMIT 1;

  -- If no active subscription, return false
  IF user_subscription IS NULL THEN
    RETURN false;
  END IF;

  -- Get subscription plan details
  SELECT p.* INTO user_plan
  FROM subscription_plans p
  WHERE p.id = user_subscription.plan_id;

  -- Log access attempt
  INSERT INTO subscription_access_logs (
    user_id,
    content_id,
    subscription_id,
    access_type,
    quality
  ) VALUES (
    $1,
    $2,
    user_subscription.id,
    'view',
    user_plan.max_quality
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 