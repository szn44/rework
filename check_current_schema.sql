-- Check current database schema
-- Run this first to see what tables and columns exist

-- Check if workspaces table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspaces' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if workspace_members table exists and its structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if issues table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'issues' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if spaces table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'spaces' AND table_schema = 'public'
ORDER BY ordinal_position;

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;