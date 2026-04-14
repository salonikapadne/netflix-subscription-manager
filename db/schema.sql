-- Netflix subscription management system for PostgreSQL
DROP DATABASE IF EXISTS netflix_clone;
CREATE DATABASE netflix_clone;
\c netflix_clone

DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- Create status enum
CREATE TYPE IF NOT EXISTS subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plans table
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price_cents INT NOT NULL,
  interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
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
);

-- Insert Netflix plans
INSERT INTO plans (name, price_cents, interval, description) VALUES
  ('Basic', 19900, 'monthly', 'Watch on 1 screen in Standard Definition'),
  ('Standard', 49900, 'monthly', 'Watch on 2 screens in High Definition'),
  ('Premium', 64900, 'monthly', 'Watch on 4 screens in Ultra HD');

-- Example user
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');
