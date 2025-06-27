-- Fix foreign key constraint issue for chat_messages
-- The constraint is still pointing to chat_channels table instead of spaces
-- Run this SQL in the Supabase SQL Editor

-- Drop the problematic foreign key constraint
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_channel_id_fkey;

-- Check what spaces exist and their IDs
SELECT 'Available spaces:' as info;
SELECT id, name, slug FROM spaces ORDER BY name;

-- Add the correct foreign key constraint pointing to spaces table
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_channel_id_fkey 
FOREIGN KEY (channel_id) REFERENCES spaces(id) ON DELETE CASCADE;

-- Test that we can now insert a message (replace the UUIDs with actual values from your spaces)
-- Uncomment and modify the INSERT below with a real space ID from the SELECT above
/*
INSERT INTO chat_messages (sender_id, channel_id, content, message_type, metadata)
VALUES (
  auth.uid(), 
  'YOUR_SPACE_ID_HERE', 
  'Test message after fixing foreign key', 
  'user', 
  '{}'::jsonb
);
*/