const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../app');

function start(pool) {
  return new Promise((resolve) => {
    const server = createApp(pool).listen(0, () => resolve(server));
  });
}
const url = (s, p) => `http://127.0.0.1:${s.address().port}${p}`;

test('GET /api/health returns OK', async () => {
  const s = await start({});
  const body = await (await fetch(url(s, '/api/health'))).json();
  assert.deepStrictEqual(body, { status: 'OK' });
  s.close();
});

test('GET /api/products returns rows from the pool', async () => {
  const rows = [{ id: 1, name: 'Guitar', category: 'Guitars', price: '10.00', stock: 1, image_url: '' }];
  const s = await start({ query: async () => [rows] });
  const body = await (await fetch(url(s, '/api/products'))).json();
  assert.deepStrictEqual(body, rows);
  s.close();
});

test('POST /api/orders rejects invalid payload', async () => {
  const s = await start({});
  const res = await fetch(url(s, '/api/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: '', items: [] }),
  });
  assert.strictEqual(res.status, 400);
  s.close();
});

test('POST /api/orders creates an order', async () => {
  const conn = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    query: async (sql) => {
      if (sql.startsWith('SELECT')) return [[{ price: '25.00', stock: 5, name: 'Item' }]];
      if (sql.startsWith('INSERT INTO orders')) return [{ insertId: 42 }];
      return [{}];
    },
  };
  const s = await start({ getConnection: async () => conn });
  const res = await fetch(url(s, '/api/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: 'Ana', items: [{ id: 1, quantity: 2 }] }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(body, { success: true, order_id: 42, total_amount: 50 });
  s.close();
});
