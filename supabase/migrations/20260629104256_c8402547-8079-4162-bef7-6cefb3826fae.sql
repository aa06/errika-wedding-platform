
-- Storage policies for public-media bucket: allow content admins to write, signed URLs (used at read time) bypass RLS.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public_media_admin_insert') THEN
    CREATE POLICY public_media_admin_insert ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'public-media' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public_media_admin_update') THEN
    CREATE POLICY public_media_admin_update ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'public-media' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_admin')))
      WITH CHECK (bucket_id = 'public-media' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public_media_admin_delete') THEN
    CREATE POLICY public_media_admin_delete ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'public-media' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public_media_admin_read') THEN
    CREATE POLICY public_media_admin_read ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'public-media' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_admin')));
  END IF;
END$$;
