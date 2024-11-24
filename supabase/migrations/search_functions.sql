-- Enable full text search
ALTER TABLE content ADD COLUMN searchable tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(cast(tags as text), '')), 'C')
  ) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX content_searchable_idx ON content USING GIN (searchable);

-- Create indexes for common filter fields
CREATE INDEX content_release_year_idx ON content(release_year);
CREATE INDEX content_language_idx ON content(language);
CREATE INDEX content_average_rating_idx ON content(average_rating);
CREATE INDEX content_view_count_idx ON content(view_count);

-- Create search analytics table
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  filters JSONB,
  result_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID REFERENCES auth.users(id)
);

-- Function to get genre facets for search results
CREATE OR REPLACE FUNCTION get_search_genre_facets(search_query TEXT)
RETURNS TABLE (
  name TEXT,
  count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.name,
    COUNT(*) as count
  FROM content c
  JOIN content_tags_junction tj ON c.id = tj.content_id
  JOIN content_tags t ON tj.tag_id = t.id
  WHERE 
    c.searchable @@ to_tsquery('english', search_query)
    AND t.type = 'genre'
  GROUP BY t.name
  ORDER BY count DESC;
END;
$$;

-- Function to get year facets for search results
CREATE OR REPLACE FUNCTION get_search_year_facets(search_query TEXT)
RETURNS TABLE (
  year INTEGER,
  count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    release_year,
    COUNT(*) as count
  FROM content
  WHERE searchable @@ to_tsquery('english', search_query)
  GROUP BY release_year
  ORDER BY release_year DESC;
END;
$$;

-- Function to get language facets for search results
CREATE OR REPLACE FUNCTION get_search_language_facets(search_query TEXT)
RETURNS TABLE (
  language TEXT,
  count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.language,
    COUNT(*) as count
  FROM content c
  WHERE searchable @@ to_tsquery('english', search_query)
  GROUP BY c.language
  ORDER BY count DESC;
END;
$$;

-- Create index for search analytics
CREATE INDEX search_analytics_query_idx ON search_analytics(query);
CREATE INDEX search_analytics_created_at_idx ON search_analytics(created_at);
CREATE INDEX search_analytics_user_id_idx ON search_analytics(user_id); 