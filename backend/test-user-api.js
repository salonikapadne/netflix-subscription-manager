// Test script to verify user registration API
const testUserRegistration = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User registration successful:', result);
    } else {
      console.log('❌ User registration failed:', result);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Also test fetching all users
const testFetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/users');
    const users = await response.json();
    console.log('👥 All users in database:', users);
  } catch (error) {
    console.log('❌ Error fetching users:', error.message);
  }
};

// Run tests
console.log('🧪 Testing user registration API...');
testUserRegistration().then(() => {
  setTimeout(testFetchUsers, 1000);
});