const db = require('./src/db');

async function resetDatabase() {
  let connection;
  try {
    // Connect to postgres database to drop/recreate the app database
    connection = db.createAdminClient({ database: 'postgres' });
    await connection.connect();

    console.log('Connected to PostgreSQL (admin)');
    await connection.query('DROP DATABASE IF EXISTS netflix_clone WITH (FORCE)');
    await connection.query('CREATE DATABASE netflix_clone');
    console.log('Database netflix_clone created');

    await connection.end();

    // Use pool to create schema and seed data. The pool already points to netflix_clone.
    await db.query(`
      CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused')
    `);
    console.log('Enum type created');

    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(150) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    await db.query(`
      CREATE TABLE plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        price_cents INT NOT NULL,
        interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Plans table created');

    await db.query(`
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
    console.log('Subscriptions table created');

    await db.query(`
      INSERT INTO plans (name, price_cents, interval, description)
      VALUES
        ('Basic', 19900, 'monthly', 'Watch on 1 screen in Standard Definition'),
        ('Standard', 49900, 'monthly', 'Watch on 2 screens in High Definition'),
        ('Premium', 64900, 'monthly', 'Watch on 4 screens in Ultra HD')
    `);
    console.log('Netflix plans inserted');

    await db.query(`
      INSERT INTO users (name, email)
      VALUES ('Test User', 'test@example.com')
    `);
    console.log('Test user inserted');

    const plans = await db.query('SELECT * FROM plans');
    console.log('Plans in database:', plans.rows);
    console.log('Database setup complete!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();