-- Fare breakdown (auditable: the rate actually charged at order time, not recomputed later)
ALTER TABLE orders ADD COLUMN base_fare NUMERIC(10,2) NOT NULL DEFAULT 5.00;
ALTER TABLE orders ADD COLUMN service_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00;
ALTER TABLE orders ADD COLUMN service_fee_amount NUMERIC(10,2) NOT NULL DEFAULT 0;

UPDATE orders SET service_fee_amount = round(fare_amount * service_fee_pct / 100, 2);

-- Human-readable sequential order code (#ORD-90001, ...), backfilled in created_at order
ALTER TABLE orders ADD COLUMN order_number INTEGER;

UPDATE orders o
SET order_number = ranked.order_number
FROM (
  SELECT id, 90000 + row_number() OVER (ORDER BY created_at) AS order_number
  FROM orders
) ranked
WHERE o.id = ranked.id;

CREATE SEQUENCE orders_order_number_seq OWNED BY orders.order_number;
SELECT setval('orders_order_number_seq', GREATEST((SELECT max(order_number) FROM orders), 90000));

ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('orders_order_number_seq');
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
