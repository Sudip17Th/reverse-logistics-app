CREATE OR REPLACE FUNCTION public.cancel_rma (
    input_rma_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    /* =========================
       Idempotency check
       (avoid double cancellation)
    ========================== */
    IF EXISTS (
        SELECT 1
        FROM rma_requests
        WHERE id = input_rma_id
          AND status = 'cancelled'
    ) THEN
        RETURN;
    END IF;

    /* =========================
       Cancel RMA request
    ========================== */
    UPDATE rma_requests
    SET status = 'cancelled',
        cancelled_at = NOW()
    WHERE id = input_rma_id;

END;
$$;