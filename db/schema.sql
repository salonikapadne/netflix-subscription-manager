-- Netflix subscription management system
CREATE DATABASE IF NOT EXISTS netflix_clone;
USE netflix_clone;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price_cents INT NOT NULL,
  interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
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
);

-- Insert Netflix plans
INSERT IGNORE INTO plans (id, name, price_cents, interval, description) VALUES
  (1, 'Basic', 19900, 'monthly', 'Watch on 1 screen in Standard Definition'),
  (2, 'Standard', 49900, 'monthly', 'Watch on 2 screens in High Definition'),
  (3, 'Premium', 64900, 'monthly', 'Watch on 4 screens in Ultra HD');

-- Example user
INSERT IGNORE INTO users (id, name, email) VALUES (1, 'Test User', 'test@example.com');
