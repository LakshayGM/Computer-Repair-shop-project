const express = require('express');
const cors = require('cors');
const db = require('./db');


console.log("DB TYPE:", typeof db);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// TEST ROUTE (IMPORTANT)
app.get('/test', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.json({ error: err.message });
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
      res.json({ success: false });
    }
  } catch (err) {
    res.json({ success: false });
  }
});

// ADD ITEM
app.post('/add-item', async (req, res) => {
  const { name, quantity, price } = req.body;
  try {
    const existing = await db.query('SELECT id FROM items WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE items SET quantity = quantity + $1, price = $2 WHERE name = $3',
        [quantity, price, name]
      );
    } else {
      await db.query(
        'INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3)',
        [name, quantity, price]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ITEMS
app.get('/items', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD TRANSACTION
app.post('/add-transaction', async (req, res) => {
  const { item_id, quantity_used } = req.body;
  try {
    await db.query(
      'INSERT INTO transactions (item_id, quantity_used, date) VALUES ($1, $2, NOW())',
      [item_id, quantity_used]
    );
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
      SELECT t.id, t.quantity_used, t.date, i.name as item_name 
      FROM transactions t 
      JOIN items i ON t.item_id = i.id 
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
    const result = await db.query('SELECT id, username FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});