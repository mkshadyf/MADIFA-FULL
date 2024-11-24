-- Enable full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search history table
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create search suggestions table
CREATE TABLE search_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT UNIQUE NOT NULL,
  weight INTEGER DEFAULT 1,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history USING gin (query gin_trgm_ops);
CREATE INDEX idx_search_suggestions_term ON search_suggestions USING gin (term gin_trgm_ops);
CREATE INDEX idx_search_suggestions_weight ON search_suggestions(weight DESC);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own search history"
  ON search_history
  USING (auth.uid() = user_id);

-- Create search functions
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  category_filter TEXT[] DEFAULT NULL,
  tag_filter TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.description,
    similarity(c.title, search_query) as sim
  FROM content c
  WHERE 
    (category_filter IS NULL OR c.categories && category_filter) AND
    (tag_filter IS NULL OR c.tags && tag_filter) AND
    (
      c.title ILIKE '%' || search_query || '%' OR
      c.description ILIKE '%' || search_query || '%' OR
      c.tags && ARRAY[search_query]
    )
  ORDER BY sim DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to update search suggestions
CREATE OR REPLACE FUNCTION update_search_suggestions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert search suggestion
  INSERT INTO search_suggestions (term, weight)
  VALUES (NEW.query, 1)
  ON CONFLICT (term)
  DO UPDATE SET
    weight = search_suggestions.weight + 1,
    updated_at = TIMEZONE('utc', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_search
  AFTER INSERT ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION update_search_suggestions(); 