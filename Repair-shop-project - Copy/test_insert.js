const db = require('./db');
async function test() {
  try {
    const res = await db.query('INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3) RETURNING *', ['Test', 1, 10.5]);
    console.log('Success:', res.rows);
  } catch (e) {
    console.error('Error in query:', e.message);
    console.error(e);
  } finally {
    db.end();
  }
}
test();
