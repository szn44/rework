-- Fix RLS policies for chat_messages table
-- Run this SQL in the Supabase SQL Editor

-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view all messages in a space" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read all messages
CREATE POLICY "chat_messages_select_policy" ON chat_messages
FOR SELECT USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
FOR INSERT WITH CHECK (
  (message_type = 'user' AND auth.uid() = sender_id) OR
  (message_type = 'agent' AND sender_id IS NULL)
);

-- Allow users to update their own messages
CREATE POLICY "chat_messages_update_policy" ON chat_messages
FOR UPDATE USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Fix foreign key constraint if needed
-- Check if the constraint points to a non-existent chat_channels table
-- and redirect it to spaces table instead
DO $$ 
BEGIN
    -- Drop the old foreign key constraint if it exists
    ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_channel_id_fkey;
    
    -- Add a new foreign key constraint to spaces table
    ALTER TABLE chat_messages 
    ADD CONSTRAINT chat_messages_channel_id_fkey 
    FOREIGN KEY (channel_id) REFERENCES spaces(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating foreign key constraint: %', SQLERRM;
END $$;