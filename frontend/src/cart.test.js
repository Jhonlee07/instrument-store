import { test, expect } from 'vitest';
import { addToCart, removeFromCart, cartTotal, cartCount } from './cart.js';

const p = { id: 1, price: '10.50', stock: 2 };

test('add, total and count', () => {
  let c = addToCart({}, p);
  c = addToCart(c, p);
  expect(cartCount(c)).toBe(2);
  expect(cartTotal(c)).toBe(21);
});

test('does not exceed stock', () => {
  let c = {};
  for (let i = 0; i < 5; i++) c = addToCart(c, p);
  expect(cartCount(c)).toBe(2);
});

test('remove decrements then deletes', () => {
  let c = addToCart(addToCart({}, p), p);
  c = removeFromCart(c, 1);
  expect(cartCount(c)).toBe(1);
  c = removeFromCart(c, 1);
  expect(cartCount(c)).toBe(0);
});
