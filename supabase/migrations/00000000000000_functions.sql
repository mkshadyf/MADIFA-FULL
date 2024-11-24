-- Create function to execute SQL statements
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role; 