CREATE DATABASE IF NOT EXISTS instrument_store CHARACTER SET utf8mb4;
USE instrument_store;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  INDEX idx_products_category (category)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, category, price, stock, image_url) VALUES
('Stratocaster Electric Guitar', 'Guitars', 799.99, 8, 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600'),
('Dreadnought Acoustic Guitar', 'Guitars', 449.00, 12, 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600'),
('88-Key Digital Piano', 'Keyboards', 1199.00, 5, 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600'),
('61-Key Synthesizer', 'Keyboards', 649.50, 7, 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=600'),
('5-Piece Drum Kit', 'Drums', 899.00, 4, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600'),
('Snare Drum 14"', 'Drums', 159.99, 15, 'https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?w=600'),
('Bb Trumpet', 'Brass', 549.00, 6, 'https://images.unsplash.com/photo-1573871666457-7c7329118cf9?w=600'),
('Alto Saxophone', 'Brass', 1299.00, 3, 'https://images.unsplash.com/photo-1573871666457-7c7329118cf9?w=600'),
('Trombone', 'Brass', 689.00, 5, 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600');
