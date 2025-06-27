-- Step 1: Identify orphaned spaces (team_id doesn't exist in workspaces)
SELECT s.id, s.name, s.slug, s.team_id, 'ORPHANED' as status
FROM spaces s
LEFT JOIN workspaces w ON s.team_id = w.id
WHERE w.id IS NULL;

-- Step 2: Show valid workspaces for reference
SELECT id, name, slug FROM workspaces ORDER BY created_at;

-- Step 3: Delete orphaned spaces (or you can choose to update them to a valid workspace)
-- UNCOMMENT THE LINE BELOW AFTER REVIEWING THE ORPHANED RECORDS:
-- DELETE FROM spaces WHERE team_id NOT IN (SELECT id FROM workspaces);

-- Alternative: Update orphaned spaces to the first available workspace
-- (uncomment if you prefer to keep the spaces rather than delete them)
-- UPDATE spaces 
-- SET team_id = (SELECT id FROM workspaces ORDER BY created_at LIMIT 1)
-- WHERE team_id NOT IN (SELECT id FROM workspaces);

-- Step 4: Verify no orphaned records remain
SELECT COUNT(*) as orphaned_count
FROM spaces s
LEFT JOIN workspaces w ON s.team_id = w.id
WHERE w.id IS NULL;