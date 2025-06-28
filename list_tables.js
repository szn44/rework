const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listTables() {
  try {
    console.log('Listing all tables...')
    
    // Try to query information schema
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_statement: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%chat%'
        ORDER BY table_name;
      `
    })
    
    if (error) {
      console.log('Error listing tables:', error)
      
      // Alternative: try to access some common tables to see what exists
      const tables = ['chat_messages', 'issues', 'workspaces', 'spaces']
      
      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (!tableError) {
            console.log(`✅ Table '${table}' exists`)
            if (tableData.length > 0) {
              console.log(`   Columns: ${Object.keys(tableData[0]).join(', ')}`)
            }
          } else {
            console.log(`❌ Table '${table}' error:`, tableError.message)
          }
        } catch (err) {
          console.log(`❌ Table '${table}' not accessible`)
        }
      }
    } else {
      console.log('Chat-related tables:', data)
    }
    
  } catch (error) {
    console.error('Failed:', error)
  }
}

listTables()