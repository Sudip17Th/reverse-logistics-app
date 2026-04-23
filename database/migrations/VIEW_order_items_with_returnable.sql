CREATE VIEW order_items_with_returnable AS
SELECT
  oi.id,
  oi.order_id,
  oi.product_name,
  oi.sku,
  oi.price,
  oi.created_at,

  r.initial_purchased_quantity,
  r.returned_qty,
  r.returnable_quantity

FROM order_items oi
JOIN order_items_returnable r
  ON oi.id = r.order_item_id;