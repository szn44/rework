-- Enhanced Chat System Database Setup
-- Run this SQL in the Supabase SQL Editor

-- Message mentions table
CREATE TABLE IF NOT EXISTS message_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentioned_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, mentioned_user_id)
);

-- Message reactions table  
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id, emoji)
);

-- Typing indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, channel_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_mentions_message_id ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_user_id ON message_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_channel_id ON typing_indicators(channel_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);

-- Enable RLS
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_mentions
CREATE POLICY "Users can view all mentions" ON message_mentions
FOR SELECT USING (true);

CREATE POLICY "Users can insert mentions for their messages" ON message_mentions
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_messages 
        WHERE chat_messages.id = message_mentions.message_id 
        AND chat_messages.sender_id = auth.uid()
    )
);

-- RLS Policies for message_reactions
CREATE POLICY "Users can view all reactions" ON message_reactions
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON message_reactions
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their channels" ON typing_indicators
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own typing status" ON typing_indicators
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to clean up old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE last_activity < NOW() - INTERVAL '10 seconds';
END;
$$;

-- Function to automatically clean up typing indicators on update
CREATE OR REPLACE FUNCTION update_typing_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$;

-- Trigger to update last_activity on typing_indicators
CREATE TRIGGER trigger_update_typing_activity
    BEFORE UPDATE ON typing_indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_typing_activity();