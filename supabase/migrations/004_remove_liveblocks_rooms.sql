-- Migration to remove Liveblocks room dependencies while preserving exact UI/UX
-- This migration adds database-driven features to replace room-based infrastructure

-- Add issue content storage to replace Liveblocks document storage
ALTER TABLE issues ADD COLUMN content JSONB DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}';
ALTER TABLE issues ADD COLUMN content_text TEXT DEFAULT ''; -- For search/indexing

-- Create enhanced comments table for Liveblocks UI integration
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL, -- Rich text content compatible with Liveblocks format
    thread_id UUID REFERENCES issue_comments(id) ON DELETE CASCADE, -- For threaded replies
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment metadata for rich interactions
CREATE TABLE IF NOT EXISTS comment_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES issue_comments(id) ON DELETE CASCADE,
    mentions UUID[] DEFAULT '{}', -- User mentions in comment
    attachments JSONB DEFAULT '[]', -- File attachments
    edit_history JSONB DEFAULT '[]', -- Track comment edits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add real-time presence tracking (who's viewing what issue)
CREATE TABLE IF NOT EXISTS issue_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cursor_position JSONB, -- For collaborative editing features
    UNIQUE(issue_id, user_id)
);

-- Activity tracking for real-time updates
CREATE TABLE IF NOT EXISTS issue_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'update', 'comment', 'assign', etc.
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_thread_id ON issue_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comment_metadata_comment_id ON comment_metadata(comment_id);
CREATE INDEX IF NOT EXISTS idx_issue_presence_issue_id ON issue_presence(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_presence_user_id ON issue_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_activity_issue_id ON issue_activity(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_activity_created_at ON issue_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_content_text ON issues USING gin(to_tsvector('english', content_text));

-- Add trigger to update content_text for search when content changes
CREATE OR REPLACE FUNCTION update_issue_content_text()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract plain text from JSONB content for search indexing
    -- This handles the Lexical editor format
    NEW.content_text = COALESCE(
        (SELECT string_agg(
            COALESCE(paragraph->>'text', ''), ' '
        ) FROM jsonb_array_elements(NEW.content->'content') AS paragraph
        WHERE paragraph->>'type' = 'paragraph'),
        ''
    );
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_issue_content_text
    BEFORE UPDATE OF content ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_issue_content_text();

-- Add trigger for updated_at on comments
CREATE TRIGGER trigger_issue_comments_updated_at
    BEFORE UPDATE ON issue_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for new tables

-- Comments policies
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on issues they can access" ON issue_comments 
    FOR SELECT USING (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on accessible issues" ON issue_comments 
    FOR INSERT WITH CHECK (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        ) AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own comments" ON issue_comments 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON issue_comments 
    FOR DELETE USING (user_id = auth.uid());

-- Comment metadata policies
ALTER TABLE comment_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment metadata for accessible comments" ON comment_metadata 
    FOR SELECT USING (
        comment_id IN (
            SELECT ic.id FROM issue_comments ic
            JOIN issues i ON i.id = ic.issue_id
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage metadata for their comments" ON comment_metadata 
    FOR ALL USING (
        comment_id IN (
            SELECT id FROM issue_comments WHERE user_id = auth.uid()
        )
    );

-- Presence policies
ALTER TABLE issue_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence on accessible issues" ON issue_presence 
    FOR SELECT USING (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their own presence" ON issue_presence 
    FOR ALL USING (user_id = auth.uid());

-- Activity policies
ALTER TABLE issue_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity on accessible issues" ON issue_activity 
    FOR SELECT USING (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create activity for accessible issues" ON issue_activity 
    FOR INSERT WITH CHECK (
        issue_id IN (
            SELECT i.id FROM issues i
            WHERE i.workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE member_id = auth.uid()
            )
        ) AND user_id = auth.uid()
    );

-- Function to log issue activity
CREATE OR REPLACE FUNCTION log_issue_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log activity when issues are updated
    INSERT INTO issue_activity (issue_id, user_id, activity_type, activity_data)
    VALUES (
        NEW.id,
        auth.uid(),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
        END,
        jsonb_build_object(
            'changes', CASE 
                WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
                    'title_changed', OLD.title != NEW.title,
                    'status_changed', OLD.status != NEW.status,
                    'priority_changed', OLD.priority != NEW.priority,
                    'assignee_changed', OLD.assignee_ids != NEW.assignee_ids,
                    'content_changed', OLD.content != NEW.content
                )
                ELSE jsonb_build_object()
            END
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add activity logging triggers
CREATE TRIGGER trigger_log_issue_activity
    AFTER INSERT OR UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION log_issue_activity();

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE issue_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_metadata;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_activity;

-- Also enable realtime for issues table if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE issues;