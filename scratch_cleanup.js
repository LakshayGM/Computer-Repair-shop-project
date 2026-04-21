const db = require('./db');

async function run() {
  try {
    const res = await db.query('SELECT name, SUM(quantity) as sum_qty, MIN(id) as primary_id FROM items GROUP BY name HAVING COUNT(id) > 1');
    for(let row of res.rows) {
        console.log("Merging:", row.name);
        try {
          await db.query('UPDATE transactions SET item_id = $1 WHERE item_id IN (SELECT id FROM items WHERE name = $2)', [row.primary_id, row.name]);
        } catch(e) {
          console.log("No transactions table or similar error, skipping transaction update.", e.message);
        }
        await db.query('UPDATE items SET quantity = $1 WHERE id = $2', [row.sum_qty, row.primary_id]);
        await db.query('DELETE FROM items WHERE name = $1 AND id != $2', [row.name, row.primary_id]);
    }
    console.log('Duplication fixed');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
