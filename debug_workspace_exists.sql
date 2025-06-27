-- Check if the workspace ID from the error exists
SELECT id, name, slug FROM workspaces WHERE id = '0ee5a448-095b-4705-8fe9-adf1a7ce6301';

-- Show all workspaces
SELECT id, name, slug FROM workspaces ORDER BY created_at;

-- Check what table team_id actually references
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

-- If team_id references a different table, check that table
SELECT table_name FROM information_schema.tables WHERE table_name IN ('teams', 'organizations');

-- Check teams table if it exists
SELECT * FROM teams WHERE id = '0ee5a448-095b-4705-8fe9-adf1a7ce6301' LIMIT 1;