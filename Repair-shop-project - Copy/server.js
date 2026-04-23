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
    await db.query(
      'INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3)',
      [name, quantity, price]
    );
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});