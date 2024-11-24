-- Function to generate a playback token
CREATE OR REPLACE FUNCTION generate_playback_token(
  content_id UUID,
  user_id UUID
)
RETURNS TABLE (token TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a secure token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Store the token with expiration
  INSERT INTO playback_tokens (
    token,
    content_id,
    user_id,
    expires_at
  ) VALUES (
    v_token,
    content_id,
    user_id,
    NOW() + INTERVAL '4 hours'
  );
  
  RETURN QUERY SELECT v_token;
END;
$$;

-- Function to validate a playback token
CREATE OR REPLACE FUNCTION validate_playback_token(token TEXT)
RETURNS TABLE (valid BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS (
    SELECT 1 
    FROM playback_tokens
    WHERE 
      token = token
      AND expires_at > NOW()
      AND revoked = false
  );
  
  -- Clean up expired tokens
  DELETE FROM playback_tokens
  WHERE expires_at <= NOW();
END;
$$;

-- Create playback tokens table
CREATE TABLE IF NOT EXISTS playback_tokens (
  token TEXT PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_playback_tokens_expiry ON playback_tokens(expires_at);
CREATE INDEX idx_playback_tokens_user ON playback_tokens(user_id);
CREATE INDEX idx_playback_tokens_content ON playback_tokens(content_id);

-- Create viewing progress table
CREATE TABLE IF NOT EXISTS viewing_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress FLOAT NOT NULL DEFAULT 0,
  duration FLOAT NOT NULL DEFAULT 0,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(content_id, user_id)
);

-- Create indexes for viewing progress
CREATE INDEX idx_viewing_progress_user ON viewing_progress(user_id);
CREATE INDEX idx_viewing_progress_content ON viewing_progress(content_id);
CREATE INDEX idx_viewing_progress_last_watched ON viewing_progress(last_watched); 