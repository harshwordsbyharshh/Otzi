-- ==============================================================================
-- ÖTZI Migration: Cloudinary Media Storage Provider Evolution
-- Target: public.media, public.projects
-- Description: Adds provider-aware columns to public.media and public.projects
--              supporting Cloudinary as media storage provider while preserving
--              full backwards compatibility with existing Supabase Storage assets.
-- Safety:
--   - Additive-only schema changes (no table drops, no column drops).
--   - Default values ('supabase') ensure existing rows remain 100% valid.
--   - RLS policies remain in full effect.
--
-- CAUTION / CRITICAL WARNING ON ROLLBACK:
--   Executing the rollback statements below will:
--   1. Drop storage_provider and file_size columns from public.media.
--   2. Permanently destroy recorded file_size metadata for all media assets.
--   3. Cause all Cloudinary assets to lose their provider distinction; application code
--      will attempt to resolve Cloudinary paths against Supabase Storage, resulting in
--      broken images and 404/400 playback failures across the public portfolio.
--   4. Do NOT execute this rollback if Cloudinary assets have been written without first
--      re-migrating or safely deleting those assets.
--
-- Rollback Instructions (Only if rollback is strictly required):
--   ALTER TABLE public.media DROP CONSTRAINT IF EXISTS check_media_storage_provider;
--   DROP INDEX IF EXISTS idx_media_storage_provider;
--   DROP INDEX IF EXISTS idx_media_project_storage_path;
--   ALTER TABLE public.media DROP COLUMN IF EXISTS file_size;
--   ALTER TABLE public.media DROP COLUMN IF EXISTS storage_provider;
--
--   ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS check_projects_cover_storage_provider;
--   DROP INDEX IF EXISTS idx_projects_cover_storage_provider;
--   ALTER TABLE public.projects DROP COLUMN IF EXISTS cover_storage_provider;
-- ==============================================================================

-- 1. Add storage_provider column to public.media (default: 'supabase')
ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'supabase';

-- 2. Add CHECK constraint on storage_provider if not present (scoped to public.media)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_media_storage_provider'
      AND conrelid = 'public.media'::regclass
  ) THEN
    ALTER TABLE public.media
      ADD CONSTRAINT check_media_storage_provider
      CHECK (storage_provider IN ('supabase', 'cloudinary'));
  END IF;
END $$;

-- 3. Add file_size column to public.media (nullable BIGINT)
ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS file_size BIGINT NULL;

-- 4. Add cover_storage_provider column to public.projects (default: 'supabase')
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS cover_storage_provider TEXT NOT NULL DEFAULT 'supabase';

-- 5. Add CHECK constraint on cover_storage_provider if not present (scoped to public.projects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_projects_cover_storage_provider'
      AND conrelid = 'public.projects'::regclass
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_projects_cover_storage_provider
      CHECK (cover_storage_provider IN ('supabase', 'cloudinary'));
  END IF;
END $$;

-- 6. Indices for provider-aware lookups and administrative queries
CREATE INDEX IF NOT EXISTS idx_media_storage_provider
  ON public.media (storage_provider);

CREATE INDEX IF NOT EXISTS idx_projects_cover_storage_provider
  ON public.projects (cover_storage_provider);

-- 7. Unique composite index to guarantee idempotent uploads and prevent duplicate media rows
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_project_storage_path
  ON public.media (project_id, storage_path);
