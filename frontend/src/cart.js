// Pure cart helpers (cart = { [productId]: { product, quantity } })
export function addToCart(cart, product) {
  const current = cart[product.id]?.quantity ?? 0;
  if (current >= product.stock) return cart;
  return { ...cart, [product.id]: { product, quantity: current + 1 } };
}

export function removeFromCart(cart, id) {
  const entry = cart[id];
  if (!entry) return cart;
  const next = { ...cart };
  if (entry.quantity <= 1) delete next[id];
  else next[id] = { ...entry, quantity: entry.quantity - 1 };
  return next;
}

export function cartTotal(cart) {
  return Object.values(cart).reduce((sum, { product, quantity }) => sum + Number(product.price) * quantity, 0);
}

export function cartCount(cart) {
  return Object.values(cart).reduce((n, { quantity }) => n + quantity, 0);
}
