const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testChatDB() {
  try {
    console.log('Testing chat_messages table access...')
    
    // Test read access
    const { data: messages, error: readError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.log('❌ Read error:', readError)
    } else {
      console.log('✅ Read access working, found', messages.length, 'messages')
    }
    
    // Test the table structure
    const { data: tableInfo, error: infoError } = await supabase
      .from('chat_messages')
      .select('id, sender_id, agent_id, channel_id, message_type, content, created_at')
      .limit(1)
    
    if (infoError) {
      console.log('❌ Table structure error:', infoError)
    } else {
      console.log('✅ Table structure looks good')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testChatDB()