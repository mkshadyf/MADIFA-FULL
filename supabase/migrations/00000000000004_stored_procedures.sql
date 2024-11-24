-- Create a function to populate the database
CREATE OR REPLACE FUNCTION populate_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert categories if they don't exist
  INSERT INTO categories (name, slug, description)
  VALUES 
    ('Movies', 'movies', 'Feature-length films'),
    ('Series', 'series', 'TV shows and web series'),
    ('Documentaries', 'documentaries', 'Non-fiction content')
  ON CONFLICT (slug) DO NOTHING;

  -- Insert sample content
  WITH category_ids AS (
    SELECT id, slug FROM categories
  )
  INSERT INTO content (title, slug, description, vimeo_id, category_id)
  SELECT 
    'Sample Movie ' || i,
    'sample-movie-' || i,
    'Description for sample movie ' || i,
    (1000000 + i)::text,
    (SELECT id FROM category_ids WHERE slug = 'movies')
  FROM generate_series(1, 5) i
  ON CONFLICT (slug) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION populate_database() TO authenticated; 