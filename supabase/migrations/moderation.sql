-- Moderation related tables
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('block', 'warn', 'delete', 'flag')),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE user_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_moderation_logs_content ON moderation_logs(content_id);
CREATE INDEX idx_moderation_logs_user ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX idx_content_flags_content ON content_flags(content_id);
CREATE INDEX idx_content_flags_status ON content_flags(status);

-- Functions
CREATE OR REPLACE FUNCTION check_user_warnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-block users with too many warnings
  IF (
    SELECT COUNT(*)
    FROM user_warnings
    WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '30 days'
  ) >= 3 THEN
    UPDATE user_profiles
    SET status = 'blocked',
        blocked_reason = 'Automatic block due to multiple warnings'
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_check_warnings
AFTER INSERT ON user_warnings
FOR EACH ROW
EXECUTE FUNCTION check_user_warnings(); 