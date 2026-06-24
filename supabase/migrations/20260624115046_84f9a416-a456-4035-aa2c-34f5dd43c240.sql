
-- Public read for public-media and testimonials buckets
CREATE POLICY "storage_public_read_public_media"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'public-media');

CREATE POLICY "storage_public_read_testimonials"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'testimonials');

CREATE POLICY "storage_admin_read_private"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'private-uploads'
  AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin') OR public.has_role(auth.uid(),'sales_admin'))
);

-- Admin write to all three buckets
CREATE POLICY "storage_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('public-media','testimonials','private-uploads')
  AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
);

CREATE POLICY "storage_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN ('public-media','testimonials','private-uploads')
  AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
);

CREATE POLICY "storage_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('public-media','testimonials','private-uploads')
  AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'content_admin'))
);
