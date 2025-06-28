const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkChatTable() {
  try {
    console.log('Checking chat_messages table structure...')
    
    // Try to get any row to see what columns exist
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Error accessing table:', error)
    } else {
      console.log('Table exists and is accessible')
      if (data.length > 0) {
        console.log('Sample row structure:', Object.keys(data[0]))
      } else {
        console.log('Table is empty')
      }
    }
    
    // Try to insert a test row to see what's required
    const testInsert = await supabase
      .from('chat_messages')
      .insert({
        space_id: 'test',
        role: 'user', 
        content: 'test message'
      })
      .select()
    
    if (testInsert.error) {
      console.log('Insert error (shows required columns):', testInsert.error)
    } else {
      console.log('✅ Test insert successful:', testInsert.data)
      
      // Clean up test message
      await supabase
        .from('chat_messages')
        .delete()
        .eq('content', 'test message')
    }
    
  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkChatTable()