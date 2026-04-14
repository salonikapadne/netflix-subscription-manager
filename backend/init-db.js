require('dotenv').config();
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  let connection;
  try {
    console.log('🔄 Initializing Netflix subscription database...\n');
    
    // Step 1: Connect to PostgreSQL server (default postgres database)
    console.log('📍 Connecting to PostgreSQL server...');
    const db = require('./src/db');
    connection = db.createAdminClient({ database: 'postgres' });
    await connection.connect();
    console.log('✅ Connected to PostgreSQL server\n', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER);

    // Step 2: Drop existing database (if exists)
    console.log('📍 Dropping existing database (if exists)...');
    await connection.query('DROP DATABASE IF EXISTS netflix_clone WITH (FORCE)');
    console.log('✅ Database dropped\n');

    // Step 3: Create database
    console.log('📍 Creating database: netflix_clone...');
    await connection.query('CREATE DATABASE netflix_clone');
    console.log('✅ Database created\n');

    // Step 4: Close connection and reconnect to new database
    await connection.end();
    
    console.log('📍 Reconnecting to netflix_clone database...');
    connection = db.createAdminClient({ database: 'netflix_clone' });
    await connection.connect();
    console.log('✅ Connected to netflix_clone database\n');

    // Step 5: Create enum type
    console.log('📍 Creating subscription_status enum type...');
    await connection.query(`
      CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused')
    `);
    console.log('✅ Enum type created\n');

    // Step 6: Create users table
    console.log('📍 Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(150) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');

    // Step 7: Create plans table
    console.log('📍 Creating plans table...');
    await connection.query(`
      CREATE TABLE plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        price_cents INT NOT NULL,
        interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Plans table created\n');

    // Step 8: Create subscriptions table
    console.log('📍 Creating subscriptions table...');
    await connection.query(`
      CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        status subscription_status DEFAULT 'active',
        started_at DATE,
        ends_at DATE NULL,
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Subscriptions table created\n');

    // Step 9: Insert sample plans
    console.log('📍 Inserting sample plans...');
    const plansData = [
      ['Basic', 19900, 'monthly', 'Watch on 1 screen in Standard Definition'],
      ['Standard', 49900, 'monthly', 'Watch on 2 screens in High Definition'],
      ['Premium', 64900, 'monthly', 'Watch on 4 screens in Ultra HD']
    ];
    
    for (const [name, price, interval, desc] of plansData) {
      await connection.query('INSERT INTO plans (name, price_cents, interval, description) VALUES ($1, $2, $3, $4)', 
        [name, price, interval, desc]);
    }
    console.log('✅ Sample plans inserted\n');

    // Step 10: Insert sample user
    console.log('📍 Inserting sample user...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await connection.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)', 
      ['Test User', 'test@example.com', passwordHash]);
    console.log('✅ Sample user inserted\n');

    // Step 11: Verify tables
    console.log('📍 Verifying data...\n');
    const plansResult = await connection.query('SELECT * FROM plans');
    const usersResult = await connection.query('SELECT * FROM users');
    
    console.log('📋 Plans:');
    console.table(plansResult.rows);
    console.log('\n👤 Users:');
    console.table(usersResult.rows);

    console.log('\n✅ Database initialization completed successfully!\n');
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL server is running');
    console.error('2. Verify credentials in .env file:');
    console.error('   - DB_HOST=', process.env.DB_HOST || '127.0.0.1');
    console.error('   - DB_PORT=', process.env.DB_PORT || 5432);
    console.error('   - DB_USER=', process.env.DB_USER || 'postgres');
    console.error('   - DB_PASS=', process.env.DB_PASS || 'postgres');
    console.error('   - DB_NAME=', process.env.DB_NAME || 'netflix_clone');
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

initializeDatabase();
