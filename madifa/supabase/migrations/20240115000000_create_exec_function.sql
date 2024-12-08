-- Create function to execute SQL statements
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$; 