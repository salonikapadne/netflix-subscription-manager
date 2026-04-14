const { Pool, Client } = require('pg');

const DEFAULT_DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres'
};

const pool = new Pool({
  ...DEFAULT_DB_CONFIG,
  database: process.env.DB_NAME || 'netflix_clone'
});

function createAdminClient(overrides = {}) {
  return new Client({
    ...DEFAULT_DB_CONFIG,
    database: overrides.database || 'postgres'
  });
}

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
  createAdminClient
};
