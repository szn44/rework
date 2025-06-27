-- Fix the slug constraint to allow more flexible naming

-- Drop the existing restrictive constraint
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_slug_format;

-- Add a new, more flexible constraint (max 40 chars, alphanumeric and hyphens)
ALTER TABLE spaces ADD CONSTRAINT spaces_slug_format 
    CHECK (slug ~ '^[a-z0-9-]{1,40}$' AND slug NOT LIKE '-%' AND slug NOT LIKE '%-');

-- This allows:
-- - Lowercase letters, numbers, and hyphens
-- - 1-40 characters long  
-- - Cannot start or end with a hyphen