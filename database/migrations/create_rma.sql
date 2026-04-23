CREATE OR REPLACE FUNCTION public.create_rma(p_user_id uuid, p_order_id uuid, p_items jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $$
DECLARE
  new_rma_id UUID;
  new_rma_number TEXT;
  item RECORD;
BEGIN

  -- Generate RMA number (simple timestamp-based)
  -- Generate RMA number (sequential + formatted)
  new_rma_number := 
    'RMA-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(nextval('rma_number_seq')::TEXT, 6, '0');

  -- Validate items first
  IF NOT validate_rma_items(p_items) THEN
    RAISE EXCEPTION 'Invalid RMA: quantity exceeds allowed limit';
  END IF;

  -- Insert into rma_requests
  INSERT INTO rma_requests (
    id,
    rma_number,
    order_id,
    status,
    created_at,
    user_id
  )
  VALUES (
    gen_random_uuid(),
    new_rma_number,
    p_order_id,
    'submitted',
    NOW(),
    p_user_id
  )
  RETURNING id INTO new_rma_id;

  -- Insert each item
  FOR item IN SELECT * FROM jsonb_to_recordset(p_items)
    AS x(order_item_id UUID, quantity INT, reason TEXT, comments TEXT)
  LOOP

    INSERT INTO rma_items (
      id,
      rma_id,
      order_item_id,
      product_name,
      sku,
      quantity,
      reason,
      comments,
      created_at
    )
    SELECT
      gen_random_uuid(),
      new_rma_id,
      oi.id,
      oi.product_name,
      oi.sku,
      item.quantity,
      item.reason,
      item.comments,
      NOW()
    FROM order_items oi
    WHERE oi.id = item.order_item_id;

  END LOOP;

  RETURN new_rma_id;

END;
$$