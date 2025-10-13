const db = require('./src/db');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Clean up all tables in correct order (due to foreign key constraints)
    await db.query('DELETE FROM subscriptions'); // Delete subscriptions first
    await db.query('ALTER TABLE subscriptions AUTO_INCREMENT = 1');
    console.log('Cleared subscriptions and reset ID counter');
    
    // Clear existing plans and reset auto-increment
    await db.query('DELETE FROM plans');
    await db.query('ALTER TABLE plans AUTO_INCREMENT = 1');
    console.log('Cleared existing plans and reset ID counter');
    
    // Clear users and reset auto-increment
    await db.query('DELETE FROM users');
    await db.query('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('Cleared users and reset ID counter');
    
    // Insert seed plans
    const plans = [
      ['Basic', 499, 'monthly', 'SD streaming, 1 screen'],
      ['Standard', 799, 'monthly', 'HD streaming, 2 screens'],
      ['Premium', 1299, 'monthly', '4K streaming, 4 screens']
    ];
    
    for (const [name, price_cents, interval, description] of plans) {
      await db.query('INSERT INTO plans (name, price_cents, `interval`, description) VALUES (?, ?, ?, ?)', 
        [name, price_cents, interval, description]);
      console.log(`Inserted plan: ${name}`);
    }
    
    // Add test user
    await db.query('INSERT INTO users (name, email) VALUES (?, ?)', 
      ['Test User', 'test@example.com']);
    console.log('Added test user with ID 1');
    
    // Show current data
    const [plans_result] = await db.query('SELECT * FROM plans ORDER BY id');
    const [users_result] = await db.query('SELECT * FROM users ORDER BY id');
    const [subs_result] = await db.query('SELECT * FROM subscriptions ORDER BY id');
    
    console.log('\nCurrent Plans:');
    console.table(plans_result);
    console.log('\nCurrent Users:');
    console.table(users_result);
    console.log('\nCurrent Subscriptions:');
    console.table(subs_result);
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('📋 All tables now start with ID = 1');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  }
}

setupDatabase();