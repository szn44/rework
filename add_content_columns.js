const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addContentColumns() {
  try {
    console.log('Adding content columns to issues table...')
    
    // First, test if we can insert a test record to check for missing columns
    const { data: testIssue, error: testError } = await supabase
      .from('issues')
      .select('id, content, content_text')
      .limit(1)
      .single()
    
    if (testError && testError.message.includes('column')) {
      console.log('❌ Content columns are missing from issues table')
      console.log('You need to run this SQL in your Supabase dashboard SQL editor:')
      console.log('')
      console.log('-- Add content columns to issues table')
      console.log("ALTER TABLE issues ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}';")
      console.log("ALTER TABLE issues ADD COLUMN IF NOT EXISTS content_text TEXT DEFAULT '';")
      console.log('')
      console.log('After running the SQL, try accessing the issue again.')
    } else {
      console.log('✅ Content columns already exist or accessible')
      
      // Test updating an issue with content
      const { data: issues } = await supabase
        .from('issues')
        .select('id')
        .limit(1)
      
      if (issues && issues.length > 0) {
        const testContent = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Test content for database-driven editor" }
              ]
            }
          ]
        }
        
        const { error: updateError } = await supabase
          .from('issues')
          .update({
            content: testContent,
            content_text: "Test content for database-driven editor"
          })
          .eq('id', issues[0].id)
        
        if (updateError) {
          console.log('❌ Error updating issue with content:', updateError.message)
        } else {
          console.log('✅ Successfully added test content to issue')
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addContentColumns()