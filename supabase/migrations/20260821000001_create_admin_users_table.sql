-- Migration: 20260821000001_create_admin_users_table.sql
-- Description: Create admin_users authorization table and RLS UPDATE policy for plots table.

-- 1. Create admin_users table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Policy for authenticated users to check their own admin status
CREATE POLICY "Allow authenticated users to read their admin status"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Add RLS UPDATE policy on public.plots strictly for authorized admin users
CREATE POLICY "Allow authorized admins to update plot status"
    ON public.plots
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );
