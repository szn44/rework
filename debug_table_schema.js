const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugTableSchema() {
  try {
    console.log('Testing minimal insert to understand requirements...')
    
    // Try inserting with just content to see what's required
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        content: 'test'
      })
      .select()
    
    if (error) {
      console.log('Error shows required fields:', error)
    } else {
      console.log('Successful minimal insert:', data)
    }
    
    // Try a different approach - see what fields have defaults
    const { data: emptyInsert, error: emptyError } = await supabase
      .from('chat_messages')
      .insert({})
      .select()
    
    if (emptyError) {
      console.log('Empty insert error:', emptyError)
    } else {
      console.log('Empty insert successful:', emptyInsert)
    }
    
  } catch (error) {
    console.error('Debug failed:', error)
  }
}

debugTableSchema()