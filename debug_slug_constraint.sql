-- Debug the slug constraint issue

-- Check the current constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'spaces'::regclass 
AND conname = 'spaces_slug_format';

-- Test the regex pattern with 'marketing'
SELECT 'marketing' ~ '^[a-z0-9-]{2,30}$' as marketing_matches;

-- Test various slug patterns
SELECT 
    'marketing' as slug,
    'marketing' ~ '^[a-z0-9-]{2,30}$' as matches_pattern;

-- Check if there are any existing spaces that might conflict
SELECT slug FROM spaces WHERE slug = 'marketing';

-- Show all existing constraints on spaces table
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'spaces'::regclass;