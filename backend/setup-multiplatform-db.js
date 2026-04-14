require('dotenv').config();
const db = require('./src/db');

const setupDatabase = async () => {
  let connection;
  try {
    // Connect to default postgres database first
    connection = db.createAdminClient({ database: 'postgres' });

    await connection.connect();
    console.log('Setting up multi-platform subscription tracker database...');

    // Create database
    await connection.query('DROP DATABASE IF EXISTS subscription_tracker');
    await connection.query('CREATE DATABASE subscription_tracker');

    // Disconnect and reconnect to new database
    await connection.end();

    connection = db.createAdminClient({ database: 'subscription_tracker' });
    await connection.connect();

    // Create enum type for subscription status
    await connection.query(`
      CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused')
    `);

    // Create platforms table
    await connection.query(`
      CREATE TABLE platforms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        brand_color VARCHAR(7) NOT NULL,
        logo_url VARCHAR(255),
        website_url VARCHAR(255),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await connection.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(150) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create plans table
    await connection.query(`
      CREATE TABLE plans (
        id SERIAL PRIMARY KEY,
        platform_id INT NOT NULL,
        name VARCHAR(100),
        price_cents INT NOT NULL,
        interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
        description TEXT,
        features JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
      )
    `);

    // Create subscriptions table
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

    // Insert platforms
    await connection.query(`
      INSERT INTO platforms (name, brand_color, logo_url, website_url, description) VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10),
      ($11, $12, $13, $14, $15),
      ($16, $17, $18, $19, $20),
      ($21, $22, $23, $24, $25)
    `, [
      'Netflix', '#E50914', '/images/netflix-logo.png', 'https://www.netflix.com', 'Global streaming platform with original content',
      'Amazon Prime Video', '#00A8E1', '/images/prime-logo.png', 'https://www.primevideo.com', 'Amazon streaming service with Prime benefits',
      'JioCinema', '#8A2BE2', '/images/jio-logo.png', 'https://www.jiocinema.com', 'Indian streaming platform with sports and entertainment',
      'ZEE5', '#6C00FF', '/images/zee5-logo.png', 'https://www.zee5.com', 'Indian OTT platform with regional content',
      'YouTube Premium', '#FF0000', '/images/youtube-logo.png', 'https://www.youtube.com/premium', 'Ad-free YouTube with background play'
    ]);

    // Insert platform-specific plans
    const plansData = [
      // Netflix Plans
      [1, 'Mobile', 14900, 'monthly', 'Mobile-only plan', { quality: '480p', screens: 1, downloads: true, devices: ['mobile', 'tablet'] }],
      [1, 'Basic', 19900, 'monthly', 'Basic plan for TV and computer', { quality: '720p', screens: 1, downloads: true, devices: ['all'] }],
      [1, 'Standard', 49900, 'monthly', 'Standard HD plan', { quality: '1080p', screens: 2, downloads: true, devices: ['all'] }],
      [1, 'Premium', 64900, 'monthly', 'Premium Ultra HD plan', { quality: '4K', screens: 4, downloads: true, devices: ['all'] }],
      
      // Amazon Prime Video Plans
      [2, 'Prime Monthly', 17900, 'monthly', 'Prime Video with Prime benefits', { quality: '4K', screens: 3, downloads: true, prime_benefits: true }],
      [2, 'Prime Yearly', 149900, 'yearly', 'Prime Video yearly with Prime benefits', { quality: '4K', screens: 3, downloads: true, prime_benefits: true }],
      
      // JioCinema Plans
      [3, 'Premium Monthly', 29900, 'monthly', 'JioCinema Premium with sports', { quality: '4K', screens: 4, downloads: true, sports: true, ad_free: true }],
      [3, 'Premium Yearly', 99900, 'yearly', 'JioCinema Premium yearly', { quality: '4K', screens: 4, downloads: true, sports: true, ad_free: true }],
      
      // ZEE5 Plans
      [4, 'Club Monthly', 9900, 'monthly', 'ZEE5 Club plan', { quality: '1080p', screens: 2, downloads: true, regional_content: true }],
      [4, 'Club Yearly', 59900, 'yearly', 'ZEE5 Club yearly plan', { quality: '1080p', screens: 2, downloads: true, regional_content: true }],
      
      // YouTube Premium Plans
      [5, 'Individual', 11900, 'monthly', 'YouTube Premium Individual', { ad_free: true, background_play: true, downloads: true, youtube_music: true }],
      [5, 'Family', 17900, 'monthly', 'YouTube Premium Family (6 accounts)', { ad_free: true, background_play: true, downloads: true, youtube_music: true, family_accounts: 6 }],
      [5, 'Student', 5900, 'monthly', 'YouTube Premium Student', { ad_free: true, background_play: true, downloads: true, youtube_music: true, student_verification: true }]
    ];

    for (const [platform_id, name, price_cents, interval, description, features] of plansData) {
      await connection.query(
        'INSERT INTO plans (platform_id, name, price_cents, interval, description, features) VALUES ($1, $2, $3, $4, $5, $6)',
        [platform_id, name, price_cents, interval, description, JSON.stringify(features)]
      );
    }

    // Add test user
    await connection.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['Test User', 'test@example.com']);

    // Display current data
    const platforms = await connection.query('SELECT * FROM platforms ORDER BY id');
    const plans = await connection.query(`
      SELECT p.*, pl.name as platform_name, pl.brand_color 
      FROM plans p 
      JOIN platforms pl ON p.platform_id = pl.id 
      ORDER BY pl.id, p.price_cents
    `);
    const users = await connection.query('SELECT * FROM users ORDER BY created_at DESC');
    const subscriptions = await connection.query('SELECT * FROM subscriptions');

    console.log('\n🎬 Current Platforms:');
    console.table(platforms.rows);
    console.log('\n📋 Current Plans:');
    console.table(plans.rows);
    console.log('\n👥 Current Users:');
    console.table(users.rows);
    console.log('\n📱 Current Subscriptions:');
    console.table(subscriptions.rows);

    console.log('\n✅ Multi-platform subscription tracker database setup completed successfully!');
    console.log('🎯 Platforms: Netflix, Prime Video, JioCinema, ZEE5, YouTube Premium');
    console.log('💰 Plans: 13 different plans across all platforms');
    console.log('📊 Database is ready to use with PostgreSQL');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();