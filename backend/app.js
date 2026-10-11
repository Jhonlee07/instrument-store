const express = require('express');
const cors = require('cors');

// The pool is injected so tests can pass a fake one.
function createApp(pool) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

  app.get('/api/products', async (_req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, category, price, stock, image_url FROM products ORDER BY category, name'
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Body: { customer_name: string, items: [{ id: number, quantity: number }] }
  // The total is computed server-side from DB prices; stock is decremented atomically.
  app.post('/api/orders', async (req, res) => {
    const { customer_name, items } = req.body || {};
    const name = typeof customer_name === 'string' ? customer_name.trim() : '';
    const valid =
      name &&
      Array.isArray(items) &&
      items.length > 0 &&
      items.every((i) => Number.isInteger(i.id) && Number.isInteger(i.quantity) && i.quantity > 0);
    if (!valid) {
      return res.status(400).json({ error: 'customer_name and a non-empty items list are required' });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      let total = 0;
      const lines = [];
      for (const { id, quantity } of items) {
        const [rows] = await conn.query('SELECT price, stock, name FROM products WHERE id = ? FOR UPDATE', [id]);
        if (rows.length === 0) throw Object.assign(new Error(`Product ${id} not found`), { status: 404 });
        if (rows[0].stock < quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${rows[0].name}`), { status: 409 });
        }
        total += Number(rows[0].price) * quantity;
        lines.push({ id, quantity, price: rows[0].price });
      }

      const [result] = await conn.query('INSERT INTO orders (customer_name, total_amount) VALUES (?, ?)', [
        name,
        total.toFixed(2),
      ]);
      for (const l of lines) {
        await conn.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [result.insertId, l.id, l.quantity, l.price]
        );
        await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [l.quantity, l.id]);
      }

      await conn.commit();
      res.status(201).json({ success: true, order_id: result.insertId, total_amount: Number(total.toFixed(2)) });
    } catch (err) {
      if (conn) await conn.rollback().catch(() => {});
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: 'Failed to create order' });
    } finally {
      if (conn) conn.release();
    }
  });

  return app;
}

module.exports = { createApp };
