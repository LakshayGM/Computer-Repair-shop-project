const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// HOME
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// TEST DATABASE
app.get('/test', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETUP DATABASE
app.get('/setup-db', async (req, res) => {
  try {
    // USERS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // ITEMS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INT DEFAULT 0,
        price INT,
        min_stock INT DEFAULT 5
      );
    `);

    // TRANSACTIONS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        item_id INT REFERENCES items(id) ON DELETE CASCADE,
        quantity_used INT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // DEFAULT USER
    await db.query(`
      INSERT INTO users (username, password)
      VALUES ('Lakshay', '7777')
      ON CONFLICT (username) DO NOTHING;
    `);

    res.send('✅ Database setup complete');
  } catch (err) {
    res.status(500).send('❌ ERROR: ' + err.message);
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET ITEMS
app.get('/items', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM items ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD ITEM
app.post('/add-item', async (req, res) => {
  const { name, quantity, price } = req.body;

  if (parseInt(quantity) < 0 || parseFloat(price) < 0) {
    return res.status(400).json({ error: 'Quantity and price cannot be negative' });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM items WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE items SET quantity = quantity + $1, price = $2 WHERE name = $3',
        [parseInt(quantity), parseFloat(price), name]
      );
    } else {
      await db.query(
        'INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3)',
        [name, parseInt(quantity), parseFloat(price)]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ADD TRANSACTION
app.post('/add-transaction', async (req, res) => {
  const { item_id, quantity_used } = req.body;

  try {
    // INSERT TRANSACTION
    await db.query(
      'INSERT INTO transactions (item_id, quantity_used) VALUES ($1, $2)',
      [item_id, quantity_used]
    );

    // UPDATE ITEM QUANTITY
    await db.query(
      'UPDATE items SET quantity = quantity - $1 WHERE id = $2',
      [quantity_used, item_id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET TRANSACTIONS
app.get('/transactions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        t.id,
        t.quantity_used,
        t.date,
        i.name AS item_name
      FROM transactions t
      JOIN items i
      ON t.item_id = i.id
      ORDER BY t.date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USERS
app.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username FROM users ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});