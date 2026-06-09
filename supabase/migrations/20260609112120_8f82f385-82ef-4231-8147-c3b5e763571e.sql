
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rescheduled_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2);

DROP POLICY IF EXISTS "Clients can update own bookings" ON public.bookings;
CREATE POLICY "Clients can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
