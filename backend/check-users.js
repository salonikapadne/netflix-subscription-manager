const db = require('./src/db');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');

    const users = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('👥 Current users in database:', users.rows);

    console.log('\n🧪 Testing user insertion...');
    const testName = 'Test User ' + Date.now();
    const testEmail = 'test' + Date.now() + '@example.com';

    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [testName, testEmail]
    );

    console.log('✅ User inserted with ID:', result.rows[0].id);
    console.log('👤 New user:', result.rows[0]);

    const updatedUsers = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('\n👥 Updated users list:', updatedUsers.rows);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();