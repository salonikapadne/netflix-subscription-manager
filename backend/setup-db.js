const db = require('./src/db');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Clean up all tables in correct order (due to foreign key constraints)
    await db.query('TRUNCATE TABLE subscriptions CASCADE');
    console.log('Cleared subscriptions');
    
    // Clear existing plans
    await db.query('TRUNCATE TABLE plans CASCADE');
    console.log('Cleared existing plans');
    
    // Clear users
    await db.query('TRUNCATE TABLE users CASCADE');
    console.log('Cleared users');
    
    // Insert seed plans
    const plans = [
      ['Basic', 499, 'monthly', 'SD streaming, 1 screen'],
      ['Standard', 799, 'monthly', 'HD streaming, 2 screens'],
      ['Premium', 1299, 'monthly', '4K streaming, 4 screens']
    ];
    
    for (const [name, price_cents, interval, description] of plans) {
      await db.query('INSERT INTO plans (name, price_cents, interval, description) VALUES ($1, $2, $3, $4)', 
        [name, price_cents, interval, description]);
      console.log(`Inserted plan: ${name}`);
    }
    
    // Add test user
    await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', 
      ['Test User', 'test@example.com']);
    console.log('Added test user with ID 1');
    
    // Show current data
    const plans_result = await db.query('SELECT * FROM plans ORDER BY id');
    const users_result = await db.query('SELECT * FROM users ORDER BY id');
    const subs_result = await db.query('SELECT * FROM subscriptions ORDER BY id');
    
    console.log('\nCurrent Plans:');
    console.table(plans_result.rows);
    console.log('\nCurrent Users:');
    console.table(users_result.rows);
    console.log('\nCurrent Subscriptions:');
    console.table(subs_result.rows);
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('📋 All tables use PostgreSQL SERIAL auto-increment');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  }
}

setupDatabase();