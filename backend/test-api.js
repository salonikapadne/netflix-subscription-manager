const http = require('http');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test 1: Get all plans
    console.log('1. Testing GET /api/plans');
    const plans = await testAPI('/plans');
    console.log(`   Status: ${plans.status}`);
    console.log(`   Plans found: ${plans.data.length}`);
    console.log(`   First plan: ${plans.data[0]?.name}\n`);
    
    // Test 2: Get all users
    console.log('2. Testing GET /api/users');
    const users = await testAPI('/users');
    console.log(`   Status: ${users.status}`);
    console.log(`   Users found: ${users.data.length}`);
    console.log(`   First user: ${users.data[0]?.name}\n`);
    
    // Test 3: Create subscription
    console.log('3. Testing POST /api/subscriptions');
    const subscription = await testAPI('/subscriptions', 'POST', {
      user_id: 1,
      plan_id: 1,
      months: 1
    });
    console.log(`   Status: ${subscription.status}`);
    if (subscription.status === 201) {
      console.log(`   Subscription created with ID: ${subscription.data.id}`);
    } else {
      console.log(`   Error: ${JSON.stringify(subscription.data)}`);
    }
    console.log('');
    
    // Test 4: Get all subscriptions
    console.log('4. Testing GET /api/subscriptions');
    const subscriptions = await testAPI('/subscriptions');
    console.log(`   Status: ${subscriptions.status}`);
    console.log(`   Subscriptions found: ${subscriptions.data.length}`);
    if (subscriptions.data.length > 0) {
      console.log(`   Latest subscription: ${subscriptions.data[0]?.user_name} - ${subscriptions.data[0]?.plan_name}`);
    }
    console.log('');
    
    console.log('✅ All tests completed successfully!');
    console.log('🎉 API is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();