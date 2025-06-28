const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixNullUserIds() {
  console.log('Fixing null user_id values in workspace_members table...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // First, check how many null user_id records exist
    const { data: nullRecords, error: checkError } = await supabase
      .from('workspace_members')
      .select('id, workspace_id')
      .is('user_id', null);

    if (checkError) {
      console.error('Error checking null records:', checkError);
      return;
    }

    console.log(`Found ${nullRecords?.length || 0} records with null user_id`);

    if (nullRecords && nullRecords.length > 0) {
      console.log('Null records:', nullRecords);

      // Remove the null user_id records since they're invalid
      const { error: deleteError } = await supabase
        .from('workspace_members')
        .delete()
        .is('user_id', null);

      if (deleteError) {
        console.error('Error deleting null records:', deleteError);
        return;
      }

      console.log(`Successfully deleted ${nullRecords.length} null user_id records`);
    }

    // Verify the fix
    const { data: remainingNulls, error: verifyError } = await supabase
      .from('workspace_members')
      .select('id')
      .is('user_id', null);

    if (verifyError) {
      console.error('Error verifying fix:', verifyError);
      return;
    }

    console.log(`Verification: ${remainingNulls?.length || 0} null user_id records remaining`);
    console.log('Fix completed successfully!');

  } catch (error) {
    console.error('Fix failed with exception:', error);
  }
}

fixNullUserIds();