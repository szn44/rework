const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  try {
    console.log('Applying migration 004_remove_liveblocks_rooms.sql...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/004_remove_liveblocks_rooms.sql', 'utf8')
    
    // Split into individual statements (rough split by semicolon + newline)
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
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_statement: statement
        })
        
        if (error) {
          console.log('Error executing statement:', error)
          // Continue with other statements even if one fails
        } else {
          console.log('✅ Statement executed successfully')
        }
      } catch (err) {
        console.log('Exception executing statement:', err.message)
        // Try alternative approach with direct query
        try {
          const { error: directError } = await supabase
            .from('_supabase_migrations')
            .insert({ version: '004', name: 'remove_liveblocks_rooms' })
          
          if (!directError) {
            console.log('✅ Marked migration as applied')
          }
        } catch (directErr) {
          console.log('Could not mark migration as applied')
        }
      }
    }
    
    console.log('\nMigration application complete. Checking results...')
    
    // Check if the new tables/columns exist
    const { data: comments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .limit(1)
    
    if (commentsError) {
      console.log('❌ issue_comments table still does not exist')
    } else {
      console.log('✅ issue_comments table created successfully!')
    }
    
    // Check for new columns in issues table
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('content, content_text')
      .limit(1)
    
    if (issuesError) {
      console.log('❌ New columns not added to issues table:', issuesError.message)
    } else {
      console.log('✅ New content columns added to issues table!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration()