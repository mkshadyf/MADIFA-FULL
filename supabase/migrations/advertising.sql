-- Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pre-roll', 'mid-roll', 'banner')),
  duration INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  targeting JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ad placements
CREATE TABLE ad_placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ad analytics
CREATE TABLE ad_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction TEXT NOT NULL CHECK (interaction IN ('view', 'click', 'skip', 'complete')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_dates ON ads(start_date, end_date);
CREATE INDEX idx_ad_analytics_ad ON ad_analytics(ad_id);
CREATE INDEX idx_ad_analytics_user ON ad_analytics(user_id);
CREATE INDEX idx_ad_analytics_interaction ON ad_analytics(interaction);

-- Functions
CREATE OR REPLACE FUNCTION update_ad_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ad metrics
  WITH metrics AS (
    SELECT 
      COUNT(*) FILTER (WHERE interaction = 'view') as views,
      COUNT(*) FILTER (WHERE interaction = 'click') as clicks,
      COUNT(*) FILTER (WHERE interaction = 'complete') as completions
    FROM ad_analytics
    WHERE ad_id = NEW.ad_id
  )
  UPDATE ads
  SET 
    view_count = metrics.views,
    click_count = metrics.clicks,
    completion_rate = CASE 
      WHEN metrics.views > 0 
      THEN (metrics.completions::float / metrics.views) * 100 
      ELSE 0 
    END,
    updated_at = NOW()
  FROM metrics
  WHERE id = NEW.ad_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating ad metrics
CREATE TRIGGER trigger_update_ad_metrics
AFTER INSERT ON ad_analytics
FOR EACH ROW
EXECUTE FUNCTION update_ad_metrics(); 