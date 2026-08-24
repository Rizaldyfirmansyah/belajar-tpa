-- ============================================================
-- Migration: Add admin role
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean default false;

-- 2. Grant admin to your account
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'rizaldysukun5@gmail.com'
);
