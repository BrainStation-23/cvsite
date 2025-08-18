
-- Create the placeholder-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('placeholder-images', 'placeholder-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the placeholder-images bucket
-- Policy to allow admins to select (view) all files
CREATE POLICY "Admins can view placeholder images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'placeholder-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Policy to allow admins to insert (upload) files
CREATE POLICY "Admins can upload placeholder images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'placeholder-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Policy to allow admins to update files
CREATE POLICY "Admins can update placeholder images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'placeholder-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Policy to allow admins to delete files
CREATE POLICY "Admins can delete placeholder images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'placeholder-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Policy to allow public read access to placeholder images (for CV generation)
CREATE POLICY "Public can view placeholder images"
ON storage.objects FOR SELECT
USING (bucket_id = 'placeholder-images');
