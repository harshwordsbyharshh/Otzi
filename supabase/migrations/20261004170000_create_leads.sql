-- ==============================================================================
-- ÖTZI Migration: Contact -> Leads System (Minimal V1)
-- Target: public.leads
-- Description: Stores visitor inquiries from /contact with strict RLS policies.
-- ==============================================================================

-- 1. Create public.leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organization text,
  email text NOT NULL,
  disciplines text[] NOT NULL DEFAULT '{}',
  details text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Performance & filtering indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Table grants
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

-- 5. RLS Policies

-- Public / Anonymous Policy: Allow anyone (visitor) to insert leads
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
CREATE POLICY "Allow public insert on leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Staff Policy: Only authenticated admin/editor users can read leads
DROP POLICY IF EXISTS "Allow staff select on leads" ON public.leads;
CREATE POLICY "Allow staff select on leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- Staff Policy: Only authenticated admin/editor users can update lead status
DROP POLICY IF EXISTS "Allow staff update on leads" ON public.leads;
CREATE POLICY "Allow staff update on leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Staff Policy: Only authenticated admin/editor users can delete leads
DROP POLICY IF EXISTS "Allow staff delete on leads" ON public.leads;
CREATE POLICY "Allow staff delete on leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.is_staff());
