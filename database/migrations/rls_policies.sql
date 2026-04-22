"CREATE POLICY ""Users can view their order items"" ON public.order_items AS PERMISSIVE  FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));"

CREATE POLICY "Users can view their own orders" ON public.orders AS PERMISSIVE  FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY "Allow read return reasons" ON public.return_reasons AS PERMISSIVE  FOR SELECT TO authenticated USING (true);

"CREATE POLICY ""Users can insert items for their own RMAs"" ON public.rma_items AS PERMISSIVE  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM rma_requests
  WHERE ((rma_requests.id = rma_items.rma_id) AND (rma_requests.user_id = auth.uid())))));"

"CREATE POLICY ""Users can view their own RMA items"" ON public.rma_items AS PERMISSIVE  FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM rma_requests
  WHERE ((rma_requests.id = rma_items.rma_id) AND (rma_requests.user_id = auth.uid())))));"

CREATE POLICY "Users can create their own RMAs" ON public.rma_requests AS PERMISSIVE  FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own RMAs" ON public.rma_requests AS PERMISSIVE  FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view own RMAs" ON public.rma_requests AS PERMISSIVE  FOR SELECT TO public USING ((auth.uid() = user_id));
