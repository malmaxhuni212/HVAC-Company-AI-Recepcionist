import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'https://esm.sh/zod@3.23.8';

const Schema = z.object({
  to: z.string().trim().toLowerCase().email().max(254),
  customerName: z.string().trim().min(1).max(120),
  serviceName: z.string().trim().min(1).max(200),
  appointmentTime: z.string().datetime(),
  amount: z.number().nonnegative(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { to, customerName, serviceName, appointmentTime, amount } = parsed.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apptDate = new Date(appointmentTime);
    const formatted = apptDate.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; color:#0F172A;">
        <h1 style="color:#0F172A; margin:0 0 8px;">Booking Confirmed ✅</h1>
        <p style="color:#475569; margin:0 0 24px;">Thank you, ${customerName}! Your appointment is locked in.</p>
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:20px; margin-bottom:20px;">
          <p style="margin:0 0 8px;"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin:0 0 8px;"><strong>Date &amp; Time:</strong> ${formatted}</p>
          <p style="margin:0;"><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
        </div>
        <p style="color:#475569; font-size:14px;">Need to change plans? You can reschedule once or cancel from your bookings page. Cancellations refund 80% of the amount paid.</p>
        <p style="color:#94A3B8; font-size:12px; margin-top:32px;">If you didn't make this booking, please ignore this email.</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bookings <onboarding@resend.dev>',
        to: [to],
        subject: `Booking confirmed: ${serviceName} on ${apptDate.toLocaleDateString()}`,
        html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Resend error', res.status, data);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-booking-confirmation error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
