// Simple script to clean up old Liveblocks issues
// Run this with: node cleanup-old-issues.js

async function cleanupOldIssues() {
  try {
    console.log('🧹 Cleaning up old issues...');
    
    const response = await fetch('http://localhost:3000/api/cleanup-old-issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cleanup completed successfully!');
      console.log(result.message);
      
      if (result.results?.length > 0) {
        console.log('\nDetails:');
        result.results.forEach(r => {
          if (r.status === 'deleted') {
            console.log(`  ✅ ${r.roomId}`);
          } else {
            console.log(`  ❌ ${r.roomId}: ${r.error}`);
          }
        });
      }
    } else {
      const error = await response.json();
      console.error('❌ Cleanup failed:', error.error);
    }
  } catch (error) {
    console.error('❌ Error running cleanup:', error.message);
  }
}

cleanupOldIssues(); 