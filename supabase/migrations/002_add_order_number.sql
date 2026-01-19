-- Add order_number column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Generate order numbers for existing orders that don't have one
UPDATE orders
SET order_number = '2WL-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM created_at)::INTEGER))
WHERE order_number IS NULL;
