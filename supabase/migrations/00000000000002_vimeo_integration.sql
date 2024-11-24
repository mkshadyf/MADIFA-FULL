-- Vimeo content mapping
CREATE TABLE vimeo_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_id TEXT NOT NULL UNIQUE,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  thumbnail_url TEXT,
  embed_url TEXT,
  privacy_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Vimeo categories mapping
CREATE TABLE vimeo_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_category_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES vimeo_categories(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Vimeo video categories mapping
CREATE TABLE vimeo_video_categories (
  video_id UUID REFERENCES vimeo_videos(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vimeo_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

-- Create indexes
CREATE INDEX idx_vimeo_videos_creator_id ON vimeo_videos(creator_id);
CREATE INDEX idx_vimeo_videos_sync_status ON vimeo_videos(sync_status);
CREATE INDEX idx_vimeo_categories_parent_id ON vimeo_categories(parent_id); 