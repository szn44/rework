const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyChatMigration() {
  try {
    console.log('Applying chat_messages migration...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/009_chat_messages.sql', 'utf8')
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...')
      
      try {
        // Try direct SQL execution
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_statement: statement
        })
        
        if (error) {
          console.log('Error executing statement:', error)
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully')
        }
      } catch (err) {
        console.log('Exception executing statement:', err.message)
      }
    }
    
    console.log('\nMigration complete. Testing chat_messages table...')
    
    // Test if table exists and is accessible
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ chat_messages table error:', error.message)
    } else {
      console.log('✅ chat_messages table is ready!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyChatMigration()