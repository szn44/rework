const fetch = require('node-fetch');

async function testAI() {
  try {
    console.log('Testing AI API directly...');
    
    const response = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '@zero test message',
        spaceId: '96330ffb-002d-4285-967b-1ce801d8ba19',
        spaceName: 'General',
        userId: '59470aa5-8a5d-40da-a6ea-a72a094f2a98',
        userEmail: 'grantadams09@gmail.com',
        recentMessages: []
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAI(); 