-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  cal_booking_id TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access for this booking system)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow inserts from edge functions (service role)
CREATE POLICY "Allow service role full access"
ON public.bookings
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for reminder queries
CREATE INDEX idx_bookings_reminder_query 
ON public.bookings (appointment_time, reminder_sent) 
WHERE reminder_sent = false;