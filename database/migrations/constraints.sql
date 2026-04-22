ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_quantity_check CHECK ((quantity > 0));
