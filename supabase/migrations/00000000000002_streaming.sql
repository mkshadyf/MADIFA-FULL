-- Streaming Sessions
CREATE TABLE streaming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  quality TEXT NOT NULL,
  format TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  bytes_transferred BIGINT DEFAULT 0,
  client_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Transcoding Jobs
CREATE TABLE transcoding_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress FLOAT DEFAULT 0,
  output_url TEXT,
  error_message TEXT,
  options JSONB NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Playback Tokens
CREATE TABLE playback_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_streaming_sessions_user ON streaming_sessions(user_id);
CREATE INDEX idx_streaming_sessions_content ON streaming_sessions(content_id);
CREATE INDEX idx_transcoding_jobs_content ON transcoding_jobs(content_id);
CREATE INDEX idx_transcoding_jobs_status ON transcoding_jobs(status);
CREATE INDEX idx_playback_tokens_user ON playback_tokens(user_id);
CREATE INDEX idx_playback_tokens_content ON playback_tokens(content_id);
CREATE INDEX idx_playback_tokens_token ON playback_tokens(token); 