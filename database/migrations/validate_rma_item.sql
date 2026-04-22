CREATE OR REPLACE FUNCTION public.validate_rma_items (
    p_items JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_item        RECORD;
    v_allowed_qty INTEGER;
BEGIN
    /* =========================
       Loop through input items
    ========================== */
    FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(
            order_item_id UUID,
            quantity       INT
        )
    LOOP

        /* =========================
           Fetch allowed quantity
           (single source of truth)
        ========================== */
        SELECT returnable_quantity
        INTO v_allowed_qty
        FROM order_items_with_returnable
        WHERE id = v_item.order_item_id;

        /* =========================
           Safety check
        ========================== */
        IF v_allowed_qty IS NULL THEN
            RAISE EXCEPTION 'Invalid order item';
        END IF;

        /* =========================
           Validation check
        ========================== */
        IF v_item.quantity > v_allowed_qty THEN
            RAISE EXCEPTION
                'Invalid RMA: quantity exceeds allowed limit';
        END IF;

    END LOOP;

    /* =========================
       All items valid
    ========================== */
    RETURN TRUE;

END;
$$;