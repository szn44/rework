-- Apply foreign key constraint AFTER cleanup

-- Drop the existing foreign key constraint on team_id (if it exists)
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_team_id_fkey;

-- Verify no orphaned records remain
SELECT COUNT(*) as orphaned_count
FROM spaces s
LEFT JOIN workspaces w ON s.team_id = w.id
WHERE w.id IS NULL;

-- If orphaned_count is 0, add the foreign key constraint
ALTER TABLE spaces ADD CONSTRAINT spaces_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create default "General" space for workspaces that don't have one
INSERT INTO spaces (name, slug, description, color, team_id, created_by)
SELECT 
    'General' as name,
    'general' as slug,
    'Default space for general tasks and discussions' as description,
    '#6b7280' as color,
    w.id as team_id,
    w.created_by
FROM workspaces w
WHERE NOT EXISTS (
    SELECT 1 FROM spaces s WHERE s.team_id = w.id AND s.slug = 'general'
);

-- Verify the results
SELECT w.name as workspace_name, w.slug as workspace_slug, s.name as space_name, s.slug as space_slug
FROM workspaces w
LEFT JOIN spaces s ON s.team_id = w.id
ORDER BY w.name, s.name;