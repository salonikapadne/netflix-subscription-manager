const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mysql',
    database: 'netflix_clone'
  });

  try {
    console.log('🔍 Checking users in database...');
    
    // Get all users
    const [users] = await connection.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('👥 Current users in database:', users);
    
    // Test inserting a new user
    console.log('\n🧪 Testing user insertion...');
    const testName = 'Test User ' + Date.now();
    const testEmail = 'test' + Date.now() + '@example.com';
    
    const [result] = await connection.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [testName, testEmail]
    );
    
    console.log('✅ User inserted with ID:', result.insertId);
    
    // Get the newly inserted user
    const [newUser] = await connection.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    console.log('👤 New user:', newUser[0]);
    
    // Get updated user list
    const [updatedUsers] = await connection.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('\n👥 Updated users list:', updatedUsers);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

checkUsers();