const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to create table
)

async function createSimpleChat() {
  try {
    console.log('Creating simple_chat_messages table...')
    
    // Create a new table with our desired structure
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS simple_chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        space_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql_statement: createTableSQL
    })
    
    if (createError) {
      console.log('Create table error:', createError)
    } else {
      console.log('✅ Table creation attempted')
    }
    
    // Create index
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_simple_chat_space_name ON simple_chat_messages(space_name);
      CREATE INDEX IF NOT EXISTS idx_simple_chat_created_at ON simple_chat_messages(created_at DESC);
    `
    
    const { data: indexResult, error: indexError } = await supabase.rpc('exec_sql', {
      sql_statement: indexSQL
    })
    
    if (indexError) {
      console.log('Index error:', indexError)
    } else {
      console.log('✅ Indexes creation attempted')
    }
    
    // Enable RLS and create policies
    const rlsSQL = `
      ALTER TABLE simple_chat_messages ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view all messages" ON simple_chat_messages
        FOR SELECT USING (true);
      
      CREATE POLICY "Users can insert their own messages" ON simple_chat_messages
        FOR INSERT WITH CHECK (
          (role = 'user' AND auth.uid() = user_id) OR
          (role = 'agent' AND user_id IS NULL)
        );
    `
    
    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec_sql', {
      sql_statement: rlsSQL
    })
    
    if (rlsError) {
      console.log('RLS error:', rlsError)
    } else {
      console.log('✅ RLS setup attempted')
    }
    
    // Test the new table
    const { data: testData, error: testError } = await supabase
      .from('simple_chat_messages')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.log('❌ New table test error:', testError)
    } else {
      console.log('✅ New table is accessible!')
    }
    
  } catch (error) {
    console.error('Failed:', error)
  }
}

createSimpleChat()