import { useEffect, useMemo, useState } from 'react';
import { addToCart, removeFromCart, cartTotal, cartCount } from './cart.js';

const money = (n) => `$${Number(n).toFixed(2)}`;
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🎵</text></svg>'
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
        <h1>🎸 SoundStage</h1>
        <button className="btn cart-btn" onClick={() => setCartOpen(true)}>
          Cart ({cartCount(cart)})
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <h2>Find your sound</h2>
          <p>Guitars, keyboards, drums and brass — ready to ship.</p>
        </section>

        {status && <div className={`banner ${status.type}`}>{status.text}</div>}

        <nav className="filters">
          {categories.map((c) => (
            <button key={c} className={`chip ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </nav>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid">
            {visible.map((p) => (
              <article className="card" key={p.id}>
                <img src={p.image_url} alt={p.name} onError={(e) => { e.currentTarget.src = FALLBACK; }} />
                <div className="card-body">
                  <span className="tag">{p.category}</span>
                  <h3>{p.name}</h3>
                  <div className="row">
                    <strong>{money(p.price)}</strong>
                    <small>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</small>
                  </div>
                  <button
                    className="btn"
                    disabled={p.stock === 0 || (cart[p.id]?.quantity ?? 0) >= p.stock}
                    onClick={() => setCart((c) => addToCart(c, p))}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
      <aside className={`drawer ${cartOpen ? 'open' : ''}`}>
        <div className="row">
          <h2>Your cart</h2>
          <button className="link" onClick={() => setCartOpen(false)}>Close</button>
        </div>
        {items.length === 0 ? (
          <p>Your cart is empty.</p>
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
            <div className="row total"><span>Total</span><strong>{money(cartTotal(cart))}</strong></div>
            <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn full" type="submit">Checkout</button>
          </form>
        )}
      </aside>
    </>
  );
}
