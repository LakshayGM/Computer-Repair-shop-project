const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234', // your postgres password
  port: 5432,
});

module.exports = pool;