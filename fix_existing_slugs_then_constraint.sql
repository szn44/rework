-- First, let's see what existing slugs we have
SELECT id, name, slug FROM spaces;

-- Update existing slugs to match the new format
UPDATE spaces 
SET slug = LOWER(
    TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(slug, '[^A-Za-z0-9\s-]', '', 'g'),  -- Remove special chars
                '\s+', '-', 'g'                                     -- Replace spaces with hyphens
            ),
            '-+', '-', 'g'                                          -- Replace multiple hyphens with single
        ),
        '-'                                                         -- Trim hyphens from start/end
    )
)
WHERE slug !~ '^[a-z0-9-]{1,40}$' 
   OR slug ~ '^-' 
   OR slug ~ '-$'
   OR LENGTH(slug) > 40;

-- Handle any slugs that might be empty after cleaning
UPDATE spaces 
SET slug = 'space-' || id::text
WHERE slug = '' OR slug IS NULL;

-- Handle any slugs that are still too long (truncate to 40 chars)
UPDATE spaces 
SET slug = SUBSTRING(slug FROM 1 FOR 40)
WHERE LENGTH(slug) > 40;

-- Remove any trailing hyphens created by truncation
UPDATE spaces 
SET slug = RTRIM(slug, '-')
WHERE slug ~ '-$';

-- Add a suffix if slug becomes empty after trimming
UPDATE spaces 
SET slug = 'space'
WHERE slug = '' OR slug IS NULL;

-- Now check what we have after cleanup
SELECT id, name, slug FROM spaces;

-- Drop the old constraint
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_slug_format;

-- Add the new constraint
ALTER TABLE spaces ADD CONSTRAINT spaces_slug_format 
    CHECK (slug ~ '^[a-z0-9-]{1,40}$' AND slug NOT LIKE '-%' AND slug NOT LIKE '%-');