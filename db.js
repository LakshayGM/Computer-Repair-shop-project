const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/postgres',
  ...(process.env.DATABASE_URL ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool;