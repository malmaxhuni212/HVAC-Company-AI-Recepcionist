CREATE POLICY "Users can create invoices for own bookings"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = invoices.booking_id
      AND (b.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);