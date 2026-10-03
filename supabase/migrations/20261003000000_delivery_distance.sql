-- Store the straight-line distance (km) used to compute the delivery fee.
-- Nullable so existing rows are unaffected.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_distance_km numeric(8, 2),
  ADD COLUMN IF NOT EXISTS delivery_discount_amount integer NOT NULL DEFAULT 0;

-- Expose the new columns in the my_orders view (recreate it)
DROP VIEW IF EXISTS my_orders;

CREATE VIEW my_orders AS
SELECT
  o.id,
  o.order_ref,
  o.product_summary,
  o.status,
  o.notes,
  o.price,
  o.delivery_type,
  o.delivery_fee,
  o.delivery_distance_km,
  o.delivery_discount_amount,
  o.market_day,
  o.discount_amount,
  o.expected_delivery_date,
  o.amount_total,
  o.created_at,
  o.w3w_address,
  o.w3w_lat,
  o.w3w_lng,
  b.full_name,
  b.phone_number,
  b.location,
  b.landmark,
  b.delivery_lat,
  b.delivery_lng,
  b.buyer_type
FROM orders o
JOIN buyers b ON b.id = o.buyer_id
WHERE b.user_id = auth.uid();
