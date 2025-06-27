-- First, check what the current foreign key references
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'spaces'
  AND kcu.column_name = 'team_id';

-- Drop the existing foreign key constraint on team_id
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_team_id_fkey;

-- Add a new foreign key constraint that references workspaces.id
ALTER TABLE spaces ADD CONSTRAINT spaces_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create a default "General" space for any workspaces that don't have one
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

-- Check the results
SELECT w.name as workspace_name, w.slug as workspace_slug, s.name as space_name, s.slug as space_slug
FROM workspaces w
LEFT JOIN spaces s ON s.team_id = w.id
ORDER BY w.name, s.name;