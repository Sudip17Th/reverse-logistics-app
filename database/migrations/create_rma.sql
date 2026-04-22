CREATE OR REPLACE FUNCTION public.create_rma (
    p_user_id  UUID,
    p_order_id UUID,
    p_items    JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_rma_id     UUID;
    v_rma_number TEXT;
    v_item       RECORD;
BEGIN
    /* =========================
       Generate RMA number
    ========================== */
    v_rma_number := 'RMA-' || EXTRACT(EPOCH FROM NOW())::BIGINT;

    /* =========================
       Validate input
    ========================== */
    IF NOT validate_rma_items(p_items) THEN
        RAISE EXCEPTION
            'Invalid RMA: quantity exceeds allowed limit';
    END IF;

    /* =========================
       Create RMA request
    ========================== */
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
        v_rma_number,
        p_order_id,
        'submitted',
        NOW(),
        p_user_id
    )
    RETURNING id INTO v_rma_id;

    /* =========================
       Insert RMA items
    ========================== */
    FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(
            order_item_id UUID,
            quantity      INT,
            reason        TEXT,
            comments      TEXT
        )
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
            v_rma_id,
            oi.id,
            oi.product_name,
            oi.sku,
            v_item.quantity,
            v_item.reason,
            v_item.comments,
            NOW()
        FROM order_items oi
        WHERE oi.id = v_item.order_item_id;
    END LOOP;

    /* =========================
       Return result
    ========================== */
    RETURN v_rma_id;

END;
$$;