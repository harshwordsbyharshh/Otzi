-- ==============================================================================
-- ÖTZI Migration: Featured Reels (Top 5) CMS Feature & Production Safety (Hardened)
-- Target: public.projects
-- Description: Adds is_featured and featured_order columns with strict database-level
--              constraints, advisory-locked trigger concurrency control, automatic
--              gap healing & recompaction on unpin/delete/unpublish/format-change,
--              and hardened SECURITY DEFINER functions with restricted privileges.
--              Security: Only trusted server-controlled profiles and service roles
--              are permitted. user_metadata is never trusted for authorization.
-- ==============================================================================

-- 1. Add is_featured and featured_order columns if not exists
ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT NULL;

-- 2. Add check constraint to ensure featured_order is strictly between 1 and 5 when featured
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_projects_featured_order_range'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_projects_featured_order_range
      CHECK (
        (is_featured = false AND featured_order IS NULL)
        OR (is_featured = true AND featured_order >= 1 AND featured_order <= 5)
      );
  END IF;
END $$;

-- 3. Unique partial index to enforce strict 1..5 uniqueness (guarantees max 5 featured reels at storage layer)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_featured_order
  ON public.projects (featured_order)
  WHERE is_featured = true;

-- 4. Index for fast public and CMS querying of featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured_lookup
  ON public.projects (is_featured, published, asset_type, featured_order);

-- 5. Trigger function: Enforce 5-reel maximum, format eligibility, and concurrency lock on all write paths
CREATE OR REPLACE FUNCTION public.enforce_featured_reels_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_other_count INTEGER;
BEGIN
  -- If project is not featured, ensure featured_order is always NULL
  IF NEW.is_featured IS NOT TRUE THEN
    NEW.is_featured := false;
    NEW.featured_order := NULL;
    RETURN NEW;
  END IF;

  -- If project is marked featured: validate published status and format eligibility
  -- If someone unpublishes or changes the format away from REEL on an already-featured project, auto-unpin it
  IF NEW.published IS NOT TRUE OR NEW.asset_type != 'REEL' THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Only published reels (format: REEL) can be pinned as featured.';
    ELSIF coalesce(OLD.is_featured, false) IS FALSE AND NEW.is_featured IS TRUE THEN
      RAISE EXCEPTION 'Only published reels (format: REEL) can be pinned as featured.';
    END IF;

    -- On UPDATE where an already-featured project is unpublished or format changed, auto-unpin cleanly
    NEW.is_featured := false;
    NEW.featured_order := NULL;
    RETURN NEW;
  END IF;

  -- Validate featured_order range
  IF NEW.featured_order IS NULL OR NEW.featured_order < 1 OR NEW.featured_order > 5 THEN
    RAISE EXCEPTION 'featured_order must be between 1 and 5 for featured reels.';
  END IF;

  -- Acquire transaction-level advisory lock to serialize concurrent pin attempts
  PERFORM pg_advisory_xact_lock(hashtext('projects_featured_reels_lock'));

  -- Count existing featured projects excluding this row
  SELECT count(*) INTO v_other_count
  FROM public.projects
  WHERE is_featured = true
    AND (TG_OP = 'INSERT' OR id != NEW.id);

  IF v_other_count >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 featured reels limit reached. You must unpin an existing reel first.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_featured_reels_integrity ON public.projects;
CREATE TRIGGER trg_enforce_featured_reels_integrity
  BEFORE INSERT OR UPDATE OF is_featured, featured_order, published, asset_type
  ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_featured_reels_integrity();

-- 6. Hardened atomic function to reorder featured reels safely in a single transaction
CREATE OR REPLACE FUNCTION public.reorder_featured_reels(p_project_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_len INTEGER;
  v_idx INTEGER;
  v_valid_count INTEGER;
BEGIN
  -- Authorize:
  -- 1. Trusted backend service role
  IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR current_setting('role', true) = 'service_role' THEN
    NULL;
  -- 2. Direct superuser / SQL Editor execution (no JWT claim, role is superuser/none)
  ELSIF auth.uid() IS NULL
     AND (current_setting('role', true) IN ('none', 'postgres', 'supabase_admin') OR session_user IN ('postgres', 'supabase_admin'))
     AND coalesce(current_setting('request.jwt.claim.role', true), '') NOT IN ('anon', 'authenticated') THEN
    NULL;
  -- 3. Authenticated admin or editor (strictly via public.profiles or server-controlled app_metadata only; user_metadata is NEVER trusted)
  ELSIF auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
    OR (
      nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    )
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'UNAUTHORIZED: Insufficient permissions to manage featured reels.';
  END IF;

  -- Acquire transaction-level advisory lock
  PERFORM pg_advisory_xact_lock(hashtext('projects_featured_reels_lock'));

  -- Mark transaction so recompaction triggers do not fire recursively or interfere
  PERFORM set_config('otzi.reordering', 'true', true);

  v_len := coalesce(array_length(p_project_ids, 1), 0);
  IF v_len > 5 THEN
    RAISE EXCEPTION 'Cannot feature more than 5 reels.';
  END IF;

  -- Verify uniqueness of IDs
  IF v_len > 0 AND (SELECT count(DISTINCT x) FROM unnest(p_project_ids) AS x) != v_len THEN
    RAISE EXCEPTION 'Duplicate project IDs are not allowed in featured order list.';
  END IF;

  -- Verify all requested IDs exist and are eligible published reels
  IF v_len > 0 THEN
    SELECT count(*) INTO v_valid_count
    FROM public.projects
    WHERE id = ANY(p_project_ids)
      AND published = true
      AND asset_type = 'REEL';

    IF v_valid_count != v_len THEN
      RAISE EXCEPTION 'All featured items must be published reels.';
    END IF;
  END IF;

  -- Step 1: Temporarily unpin all currently featured reels to prevent unique index conflicts during swaps
  UPDATE public.projects
  SET is_featured = false, featured_order = NULL
  WHERE is_featured = true;

  -- Step 2: Assign new order 1..v_len
  IF v_len > 0 THEN
    FOR v_idx IN 1..v_len LOOP
      UPDATE public.projects
      SET is_featured = true, featured_order = v_idx
      WHERE id = p_project_ids[v_idx];
    END LOOP;
  END IF;
END;
$$;

-- 7. Trigger to automatically recompact remaining featured reels on unpin, delete, unpublish, or format change
CREATE OR REPLACE FUNCTION public.recompact_featured_reels_after_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining_ids UUID[];
BEGIN
  -- Prevent recursive trigger invocation or interference with active reordering
  IF pg_trigger_depth() > 1 OR current_setting('otzi.reordering', true) = 'true' THEN
    RETURN NULL;
  END IF;

  -- Only react if an already-featured reel is deleted, unpinned, unpublished, or changed format
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_featured IS NOT TRUE THEN
      RETURN NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_featured IS NOT TRUE OR (NEW.is_featured IS TRUE AND NEW.published IS TRUE AND NEW.asset_type = 'REEL') THEN
      RETURN NULL;
    END IF;
  ELSE
    RETURN NULL;
  END IF;

  -- Acquire advisory lock during recompaction
  PERFORM pg_advisory_xact_lock(hashtext('projects_featured_reels_lock'));

  -- Gather all remaining active featured reels in order
  IF TG_OP = 'DELETE' THEN
    SELECT coalesce(array_agg(id ORDER BY featured_order ASC NULLS LAST, created_at DESC), ARRAY[]::UUID[])
    INTO v_remaining_ids
    FROM public.projects
    WHERE is_featured = true
      AND published = true
      AND asset_type = 'REEL'
      AND id != OLD.id;
  ELSE
    SELECT coalesce(array_agg(id ORDER BY featured_order ASC NULLS LAST, created_at DESC), ARRAY[]::UUID[])
    INTO v_remaining_ids
    FROM public.projects
    WHERE is_featured = true
      AND published = true
      AND asset_type = 'REEL';
  END IF;

  -- Recompact remaining reels to contiguous positions 1..N
  PERFORM public.reorder_featured_reels(v_remaining_ids);

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompact_featured_reels ON public.projects;
CREATE TRIGGER trg_recompact_featured_reels
  AFTER UPDATE OF is_featured, published, asset_type OR DELETE
  ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.recompact_featured_reels_after_change();

-- 8. Atomic function to pin a single reel safely with advisory lock and auto gap-healing
CREATE OR REPLACE FUNCTION public.pin_featured_reel(p_project_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_reel BOOLEAN;
  v_published BOOLEAN;
  v_is_featured BOOLEAN;
  v_existing_order INTEGER;
  v_existing_ids UUID[];
BEGIN
  -- Authorize:
  -- 1. Trusted backend service role
  IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR current_setting('role', true) = 'service_role' THEN
    NULL;
  -- 2. Direct superuser / SQL Editor execution (no JWT claim, role is superuser/none)
  ELSIF auth.uid() IS NULL
     AND (current_setting('role', true) IN ('none', 'postgres', 'supabase_admin') OR session_user IN ('postgres', 'supabase_admin'))
     AND coalesce(current_setting('request.jwt.claim.role', true), '') NOT IN ('anon', 'authenticated') THEN
    NULL;
  -- 3. Authenticated admin or editor (strictly via public.profiles or server-controlled app_metadata only; user_metadata is NEVER trusted)
  ELSIF auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
    OR (
      nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    )
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'UNAUTHORIZED: Insufficient permissions to manage featured reels.';
  END IF;

  -- Acquire transaction advisory lock
  PERFORM pg_advisory_xact_lock(hashtext('projects_featured_reels_lock'));

  -- Validate target project
  SELECT published, (asset_type = 'REEL'), is_featured, featured_order
  INTO v_published, v_is_reel, v_is_featured, v_existing_order
  FROM public.projects
  WHERE id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found in studio archive.';
  END IF;

  IF NOT v_published THEN
    RAISE EXCEPTION 'Only published projects can be pinned as featured reels.';
  END IF;

  IF NOT v_is_reel THEN
    RAISE EXCEPTION 'Only projects of format "REEL" can be pinned as featured.';
  END IF;

  IF v_is_featured AND v_existing_order IS NOT NULL THEN
    RETURN v_existing_order;
  END IF;

  -- Gather existing featured reel IDs in current sequence order (excluding this reel)
  SELECT coalesce(array_agg(id ORDER BY featured_order ASC NULLS LAST, created_at DESC), ARRAY[]::UUID[])
  INTO v_existing_ids
  FROM public.projects
  WHERE is_featured = true AND id != p_project_id;

  IF coalesce(array_length(v_existing_ids, 1), 0) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 featured reels limit reached. You must unpin an existing reel first.';
  END IF;

  -- Append new reel to existing sequence and reorder atomically (heals any gaps automatically)
  v_existing_ids := array_append(v_existing_ids, p_project_id);
  PERFORM public.reorder_featured_reels(v_existing_ids);

  RETURN array_length(v_existing_ids, 1);
END;
$$;

-- 9. Atomic function to unpin a reel and recompact remaining featured reels
CREATE OR REPLACE FUNCTION public.unpin_featured_reel(p_project_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Authorize:
  -- 1. Trusted backend service role
  IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR current_setting('role', true) = 'service_role' THEN
    NULL;
  -- 2. Direct superuser / SQL Editor execution (no JWT claim, role is superuser/none)
  ELSIF auth.uid() IS NULL
     AND (current_setting('role', true) IN ('none', 'postgres', 'supabase_admin') OR session_user IN ('postgres', 'supabase_admin'))
     AND coalesce(current_setting('request.jwt.claim.role', true), '') NOT IN ('anon', 'authenticated') THEN
    NULL;
  -- 3. Authenticated admin or editor (strictly via public.profiles or server-controlled app_metadata only; user_metadata is NEVER trusted)
  ELSIF auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
    OR (
      nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    )
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'UNAUTHORIZED: Insufficient permissions to manage featured reels.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('projects_featured_reels_lock'));

  -- Unpin project (the AFTER trigger will automatically recompact remaining reels)
  UPDATE public.projects
  SET is_featured = false,
      featured_order = NULL,
      updated_at = now()
  WHERE id = p_project_id;
END;
$$;

-- 10. Revoke default PUBLIC and anon execution privileges on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.reorder_featured_reels(UUID[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pin_featured_reel(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unpin_featured_reel(UUID) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON FUNCTION public.reorder_featured_reels(UUID[]) FROM anon;
    REVOKE ALL ON FUNCTION public.pin_featured_reel(UUID) FROM anon;
    REVOKE ALL ON FUNCTION public.unpin_featured_reel(UUID) FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION public.reorder_featured_reels(UUID[]) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.pin_featured_reel(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.unpin_featured_reel(UUID) TO authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.reorder_featured_reels(UUID[]) TO service_role;
    GRANT EXECUTE ON FUNCTION public.pin_featured_reel(UUID) TO service_role;
    GRANT EXECUTE ON FUNCTION public.unpin_featured_reel(UUID) TO service_role;
  END IF;
END $$;
