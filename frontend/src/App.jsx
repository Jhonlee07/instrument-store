import { useEffect, useMemo, useState } from 'react';
import { addToCart, removeFromCart, cartTotal, cartCount } from './cart.js';

const money = (n) => `$${Number(n).toFixed(2)}`;
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="#eeeeee"/><text x="50%" y="50%" font-size="24" font-family="Helvetica,Arial" text-anchor="middle" dominant-baseline="middle" fill="#999">No image</text></svg>'
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text }
  const [loading, setLoading] = useState(true);

  const loadProducts = () =>
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load products'))))
      .then(setProducts)
      .catch((e) => setStatus({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));

  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);
  const visible = category === 'All' ? products : products.filter((p) => p.category === category);
  const items = Object.values(cart);

  async function checkout(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          items: items.map(({ product, quantity }) => ({ id: product.id, quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      setCart({});
      setName('');
      setCartOpen(false);
      setStatus({ type: 'ok', text: `Order #${data.order_id} placed! Total ${money(data.total_amount)}. Thank you!` });
      loadProducts();
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  }

  return (
    <>
      <header className="header">
        <h1 className="logo">Intone<span>.</span></h1>
        <span className="meta">Musical Instruments — Est. 2026</span>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          Cart <span className="count">{String(cartCount(cart)).padStart(2, '0')}</span>
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <h2>Build your<br />sound.</h2>
          <p>Guitars, keyboards, drums and brass. Carefully selected, ready to ship.</p>
        </section>

        {status && <div className={`banner ${status.type}`}>{status.text}</div>}

        <nav className="filters">
          {categories.map((c) => (
            <button key={c} className={`filter ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="meta">Loading…</p>
        ) : (
          <div className="grid">
            {visible.map((p, i) => (
              <article className="card" key={p.id}>
                <div className="card-top">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="meta">{p.category}</span>
                </div>
                <img src={p.image_url} alt={p.name} onError={(e) => { e.currentTarget.src = FALLBACK; }} />
                <h3>{p.name}</h3>
                <div className="card-bottom">
                  <strong>{money(p.price)}</strong>
                  <span className="meta">{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</span>
                </div>
                <button
                  className="add"
                  disabled={p.stock === 0 || (cart[p.id]?.quantity ?? 0) >= p.stock}
                  onClick={() => setCart((c) => addToCart(c, p))}
                >
                  Add to cart +
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Intone</span>
        <span className="meta">Guitars / Keyboards / Drums / Brass</span>
      </footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
      <aside className={`drawer ${cartOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>Cart</h2>
          <button className="link" onClick={() => setCartOpen(false)}>Close ×</button>
        </div>
        {items.length === 0 ? (
          <p className="meta">Your cart is empty.</p>
        ) : (
          <form onSubmit={checkout}>
            <ul className="lines">
              {items.map(({ product, quantity }) => (
                <li key={product.id}>
                  <span>{product.name}</span>
                  <span className="qty">
                    <button type="button" onClick={() => setCart((c) => removeFromCart(c, product.id))}>−</button>
                    {quantity}
                    <button type="button" onClick={() => setCart((c) => addToCart(c, product))}>+</button>
                  </span>
                  <span>{money(Number(product.price) * quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="total"><span className="meta">Total</span><strong>{money(cartTotal(cart))}</strong></div>
            <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="checkout" type="submit">Checkout →</button>
          </form>
        )}
      </aside>
    </>
  );
}
