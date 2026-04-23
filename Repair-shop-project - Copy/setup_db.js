const pool = require('./db');

async function setup() {
  try {
    console.log('Creating tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Create items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        min_stock INTEGER DEFAULT 0
      )
    `);

    // Insert user if not exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['Lakshay']);
    if (userCheck.rows.length === 0) {
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['Lakshay', '7777']);
      console.log('Sample user Lakshay created.');
    }

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Setup error:', err.message);
  } finally {
    pool.end();
  }
}

setup();
