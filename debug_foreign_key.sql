-- Check what the team_id foreign key references
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'spaces'
  AND kcu.column_name = 'team_id';

-- Check if the workspace_id exists in the referenced table
SELECT '0ee5a448-095b-4705-8fe9-adf1a7ce6301' as workspace_id_to_check;

-- Check if there's a 'teams' table and what's in it
SELECT * FROM information_schema.tables WHERE table_name = 'teams';

-- If teams table exists, check its contents
SELECT * FROM teams LIMIT 5;