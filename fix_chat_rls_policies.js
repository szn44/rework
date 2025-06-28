const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixChatRLSPolicies() {
  console.log('Fixing chat_messages RLS policies...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Drop existing policies if they exist
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view all messages in a space" ON chat_messages;',
      'DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;',
      'DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;',
      'DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;'
    ];

    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('does not exist')) {
        console.log('Warning dropping policy:', error.message);
      }
    }

    // Create new policies that match the current table structure
    const policies = [
      `-- Enable RLS if not already enabled
       ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;`,
      
      `-- Allow users to read all messages
       CREATE POLICY "chat_messages_select_policy" ON chat_messages
       FOR SELECT USING (true);`,
      
      `-- Allow authenticated users to insert messages
       CREATE POLICY "chat_messages_insert_policy" ON chat_messages
       FOR INSERT WITH CHECK (
         (message_type = 'user' AND auth.uid() = sender_id) OR
         (message_type = 'agent' AND sender_id IS NULL)
       );`,
       
      `-- Allow users to update their own messages
       CREATE POLICY "chat_messages_update_policy" ON chat_messages
       FOR UPDATE USING (auth.uid() = sender_id)
       WITH CHECK (auth.uid() = sender_id);`
    ];

    for (const policy of policies) {
      console.log('Executing:', policy.split('\n')[1]?.trim() || policy.substring(0, 50));
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error('Error executing policy:', error);
      } else {
        console.log('✅ Policy executed successfully');
      }
    }

    console.log('\nTesting message insert...');
    // Test inserting a message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: '31bbe1d7-32b0-4d88-9f95-46d4091c8631', // Use a known user ID
        channel_id: '4c257b87-a74f-4ac7-ab2d-177cef70338c', // Use a known space ID
        content: 'Test message from RLS fix script',
        message_type: 'user',
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Test insert failed:', error);
    } else {
      console.log('✅ Test insert successful:', data.id);
    }

  } catch (error) {
    console.error('Script failed:', error);
  }
}

fixChatRLSPolicies();