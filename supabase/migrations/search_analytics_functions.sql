-- Get popular search queries
CREATE OR REPLACE FUNCTION get_popular_queries(start_date timestamp, limit_num int)
RETURNS TABLE (query text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.query,
    COUNT(*) as count
  FROM search_analytics sa
  WHERE sa.created_at >= start_date
  GROUP BY sa.query
  ORDER BY count DESC
  LIMIT limit_num;
END;
$$ LANGUAGE plpgsql;

-- Get daily search counts
CREATE OR REPLACE FUNCTION get_daily_searches(start_date timestamp)
RETURNS TABLE (date text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(sa.created_at::date, 'YYYY-MM-DD') as date,
    COUNT(*) as count
  FROM search_analytics sa
  WHERE sa.created_at >= start_date
  GROUP BY sa.created_at::date
  ORDER BY sa.created_at::date;
END;
$$ LANGUAGE plpgsql;

-- Get queries with no results
CREATE OR REPLACE FUNCTION get_no_result_queries(start_date timestamp, limit_num int)
RETURNS TABLE (query text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.query,
    COUNT(*) as count
  FROM search_analytics sa
  WHERE sa.created_at >= start_date
    AND sa.results_count = 0
  GROUP BY sa.query
  ORDER BY count DESC
  LIMIT limit_num;
END;
$$ LANGUAGE plpgsql;

-- Get search category distribution
CREATE OR REPLACE FUNCTION get_search_categories(start_date timestamp)
RETURNS TABLE (category text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(sa.filters->>'category', 'All') as category,
    COUNT(*) as count
  FROM search_analytics sa
  WHERE sa.created_at >= start_date
  GROUP BY sa.filters->>'category'
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql; 