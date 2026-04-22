CREATE OR REPLACE FUNCTION public.cancel_rma (
    p_rma_id    UUID,
    p_reason    TEXT,
    p_comments  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    /* =========================
       Cancel RMA request only
       (no side effects)
    ========================== */
    UPDATE rma_requests
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancel_reason = p_reason,
        cancel_comments = p_comments
    WHERE id = p_rma_id;

END;
$$;