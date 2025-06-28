const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testChatInsert() {
  try {
    console.log('Testing message insert...')
    
    // Test user message insert
    const { data: userMessage, error: userError } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: '12345678-1234-1234-1234-123456789012', // fake UUID for test
        channel_id: 'general',
        content: 'Hello from test!',
        message_type: 'user',
      })
      .select()
    
    if (userError) {
      console.log('❌ User message insert error:', userError)
    } else {
      console.log('✅ User message inserted:', userMessage[0].id)
    }
    
    // Test agent message insert
    const { data: agentMessage, error: agentError } = await supabase
      .from('chat_messages')
      .insert({
        agent_id: 'zero',
        channel_id: 'general',
        content: 'Hello! I am @zero assistant.',
        message_type: 'agent',
      })
      .select()
    
    if (agentError) {
      console.log('❌ Agent message insert error:', agentError)
    } else {
      console.log('✅ Agent message inserted:', agentMessage[0].id)
    }
    
    // Read messages back
    const { data: messages, error: readError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', 'general')
      .order('created_at', { ascending: true })
    
    if (readError) {
      console.log('❌ Read error:', readError)
    } else {
      console.log('✅ Found', messages.length, 'messages in general channel')
      messages.forEach(msg => {
        console.log(`  - ${msg.message_type}: ${msg.content}`)
      })
    }
    
    // Clean up test messages
    const { error: cleanupError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('channel_id', 'general')
    
    if (!cleanupError) {
      console.log('✅ Test messages cleaned up')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testChatInsert()