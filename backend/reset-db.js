const mysql = require('mysql2/promise');

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mysql'
  });

  try {
    console.log('Connected to MySQL');
    
    // Drop and recreate database
    await connection.query('DROP DATABASE IF EXISTS netflix_clone');
    await connection.query('CREATE DATABASE netflix_clone');
    await connection.query('USE netflix_clone');
    
    console.log('Database netflix_clone created');
    
    // Create users table
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(150) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');
    
    // Create plans table
    await connection.query(`
      CREATE TABLE plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        price_cents INT NOT NULL,
        \`interval\` VARCHAR(20) NOT NULL DEFAULT 'monthly',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Plans table created');
    
    // Create subscriptions table
    await connection.query(`
      CREATE TABLE subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        status ENUM('active','cancelled','expired','paused') DEFAULT 'active',
        started_at DATE,
        ends_at DATE NULL,
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
      )
    `);
    console.log('Subscriptions table created');
    
    // Clear existing plans and insert correct Netflix plans
    await connection.query('DELETE FROM plans');
    await connection.query('ALTER TABLE plans AUTO_INCREMENT = 1');
    
    await connection.query(`
      INSERT INTO plans (id, name, price_cents, \`interval\`, description) VALUES
        (1, 'Basic', 19900, 'monthly', 'Watch on 1 screen in Standard Definition'),
        (2, 'Standard', 49900, 'monthly', 'Watch on 2 screens in High Definition'),
        (3, 'Premium', 64900, 'monthly', 'Watch on 4 screens in Ultra HD')
    `);
    console.log('Netflix plans inserted');
    
    // Insert example user
    await connection.query(`
      INSERT INTO users (id, name, email) VALUES (1, 'Test User', 'test@example.com')
    `);
    console.log('Test user inserted');
    
    // Verify plans
    const [plans] = await connection.query('SELECT * FROM plans');
    console.log('Plans in database:', plans);
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

resetDatabase();