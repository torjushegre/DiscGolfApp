-- Storage policies for disc-photos bucket.
-- Users can only write to their own folder (named after their auth.uid()),
-- but anyone can read (bucket is public so photo URLs work without tokens).
--
-- Clean up auto-generated policies from the Dashboard UI if present.
DROP POLICY IF EXISTS "edee2h_0" ON storage.objects;
DROP POLICY IF EXISTS "edee2h_1" ON storage.objects;

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'disc-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'disc-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'disc-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

