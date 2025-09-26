-- Create function to get all public schema table names
CREATE OR REPLACE FUNCTION public.get_public_tables()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_names TEXT[];
BEGIN
  SELECT ARRAY(
    SELECT t.table_name::TEXT
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
  ) INTO table_names;
  
  RETURN table_names;
END;
$$;