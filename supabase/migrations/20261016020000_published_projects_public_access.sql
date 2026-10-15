-- ==============================================================================
-- ÖTZI Migration: Public Read Access for Published Projects & Associated Media
-- Target: public.projects, public.media, storage.objects
-- Description: Permits anonymous and authenticated public read access strictly
--              for published project records and their associated media assets.
-- Security:
--   - Row Level Security (RLS) remains enabled.
--   - Unpublished drafts, creator metadata, and private items remain protected.
--   - Storage objects are restricted strictly to assets linked to published projects.
--   - Does NOT expose or require service-role credentials to the browser.
-- ==============================================================================

-- 1. Ensure Row Level Security (RLS) is enabled
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media ENABLE ROW LEVEL SECURITY;

-- 2. Table-level SELECT grants for anonymous and authenticated visitors
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.media TO anon, authenticated;

-- 3. RLS Policy on public.projects: Allow public read of published projects only
DROP POLICY IF EXISTS "Allow public read on published projects" ON public.projects;
CREATE POLICY "Allow public read on published projects"
  ON public.projects
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- 4. RLS Policy on public.media: Allow public read of media attached to published projects
DROP POLICY IF EXISTS "Allow public read on published project media" ON public.media;
CREATE POLICY "Allow public read on published project media"
  ON public.media
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.media.project_id
      AND public.projects.published = true
    )
  );

-- 5. Storage RLS Policy on storage.objects: Allow public read of published assets in 'otzi-media'
DROP POLICY IF EXISTS "Allow public select on published project storage objects" ON storage.objects;
CREATE POLICY "Allow public select on published project storage objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'otzi-media'
    AND (
      EXISTS (
        SELECT 1 FROM public.projects
        WHERE public.projects.published = true
        AND (
          public.projects.cover_path = storage.objects.name
          OR EXISTS (
            SELECT 1 FROM public.media
            WHERE public.media.project_id = public.projects.id
            AND public.media.storage_path = storage.objects.name
          )
        )
      )
    )
  );
