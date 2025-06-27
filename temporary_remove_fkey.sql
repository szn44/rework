-- Temporarily remove the foreign key constraint so space creation works
ALTER TABLE spaces DROP CONSTRAINT IF EXISTS spaces_team_id_fkey;

-- Create a default "General" space for the current workspace
INSERT INTO spaces (name, slug, description, color, team_id, created_by)
SELECT 
    'General' as name,
    'general' as slug,
    'Default space for general tasks and discussions' as description,
    '#6b7280' as color,
    '0ee5a448-095b-4705-8fe9-adf1a7ce6301' as team_id,
    (SELECT created_by FROM workspaces WHERE id = '0ee5a448-095b-4705-8fe9-adf1a7ce6301' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM spaces WHERE team_id = '0ee5a448-095b-4705-8fe9-adf1a7ce6301' AND slug = 'general'
);

-- Show current spaces for this workspace
SELECT * FROM spaces WHERE team_id = '0ee5a448-095b-4705-8fe9-adf1a7ce6301';