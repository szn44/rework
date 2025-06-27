-- Step 1: Drop the existing constraint FIRST
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_slug_format;

-- Step 2: See what existing slugs we have
SELECT id, name, slug FROM spaces;

-- Step 3: Update existing slugs to match the new format
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
);

-- Step 4: Handle any slugs that might be empty after cleaning
UPDATE spaces 
SET slug = 'space-' || id::text
WHERE slug = '' OR slug IS NULL;

-- Step 5: Handle any slugs that are still too long (truncate to 40 chars)
UPDATE spaces 
SET slug = SUBSTRING(slug FROM 1 FOR 40)
WHERE LENGTH(slug) > 40;

-- Step 6: Remove any trailing hyphens created by truncation
UPDATE spaces 
SET slug = RTRIM(slug, '-')
WHERE slug ~ '-$';

-- Step 7: Add a suffix if slug becomes empty after trimming
UPDATE spaces 
SET slug = 'space'
WHERE slug = '' OR slug IS NULL;

-- Step 8: Check what we have after cleanup
SELECT id, name, slug, 
       slug ~ '^[a-z0-9-]{1,40}$' as matches_pattern,
       slug NOT LIKE '-%' as no_leading_hyphen,
       slug NOT LIKE '%-' as no_trailing_hyphen
FROM spaces;

-- Step 9: Add the new constraint LAST
ALTER TABLE spaces ADD CONSTRAINT spaces_slug_format 
    CHECK (slug ~ '^[a-z0-9-]{1,40}$' AND slug NOT LIKE '-%' AND slug NOT LIKE '%-');