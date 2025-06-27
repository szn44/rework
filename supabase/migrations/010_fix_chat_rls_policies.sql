-- Fix RLS policies for chat_messages table to match current structure

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all messages in a space" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read all messages (open for MVP)
CREATE POLICY "chat_messages_select_policy" ON chat_messages
FOR SELECT USING (true);

-- Allow authenticated users to insert messages
-- Users can insert messages as themselves, agents can be inserted without sender_id
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
FOR INSERT WITH CHECK (
  (message_type = 'user' AND auth.uid() = sender_id) OR
  (message_type = 'agent' AND sender_id IS NULL)
);

-- Allow users to update their own messages
CREATE POLICY "chat_messages_update_policy" ON chat_messages
FOR UPDATE USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Also check if we need to handle the foreign key constraint issue
-- If chat_channels table doesn't exist, we might need to drop the constraint
-- or create the chat_channels table

-- Check if foreign key constraint exists and drop it if needed for spaces
DO $$ 
BEGIN
    -- Drop foreign key constraint if it exists and points to non-existent table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_channel_id_fkey' 
        AND table_name = 'chat_messages'
    ) THEN
        -- Check if chat_channels table exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'chat_channels'
        ) THEN
            ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_channel_id_fkey;
            -- Add a new foreign key constraint to spaces table instead
            ALTER TABLE chat_messages 
            ADD CONSTRAINT chat_messages_channel_id_fkey 
            FOREIGN KEY (channel_id) REFERENCES spaces(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;