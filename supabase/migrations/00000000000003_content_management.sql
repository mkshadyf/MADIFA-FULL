-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create content types enum
CREATE TYPE content_type AS ENUM ('movie', 'series', 'episode', 'clip');

-- Create content status enum
CREATE TYPE content_status AS ENUM (
  'draft',
  'processing',
  'published',
  'archived',
  'deleted'
);

-- Create content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type content_type NOT NULL,
  status content_status DEFAULT 'draft',
  vimeo_id TEXT UNIQUE,
  vimeo_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  release_date DATE,
  categories TEXT[],
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  requires_subscription BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create series episodes table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vimeo_id TEXT UNIQUE,
  vimeo_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  episode_number INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  status content_status DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(series_id, season_number, episode_number)
);

-- Create content categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create content_categories junction table
CREATE TABLE content_categories (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (content_id, category_id)
);

-- Create indexes
CREATE INDEX idx_content_title ON content USING gin (title gin_trgm_ops);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_featured ON content(is_featured) WHERE is_featured = true;
CREATE INDEX idx_episodes_series ON episodes(series_id);
CREATE INDEX idx_episodes_number ON episodes(season_number, episode_number);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_content_categories_content ON content_categories(content_id);
CREATE INDEX idx_content_categories_category ON content_categories(category_id);

-- Enable Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Public content is viewable by everyone"
  ON content FOR SELECT
  USING (status = 'published' AND requires_subscription = false);

CREATE POLICY "Subscribers can view subscription content"
  ON content FOR SELECT
  USING (
    status = 'published' AND (
      requires_subscription = false OR
      EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = auth.uid()
        AND s.status = 'active'
      )
    )
  );

CREATE POLICY "Admin users can manage all content"
  ON content
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Create functions for content management
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER episodes_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at(); 