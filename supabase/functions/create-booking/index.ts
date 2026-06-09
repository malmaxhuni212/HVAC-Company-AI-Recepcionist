import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BookingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  time: z.string().datetime(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    const userId = claimsData.claims.sub as string;

    // Validate input
    const body = await req.json().catch(() => ({}));
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    const { name, email, time } = parsed.data;

    // Ensure time is in the future
    const apptDate = new Date(time);
    if (Number.isNaN(apptDate.getTime()) || apptDate.getTime() <= Date.now()) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const calApiKey = Deno.env.get("CAL_API_KEY");
    if (!calApiKey) {
      console.error("CAL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Booking service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const calResponse = await fetch("https://api.cal.com/v1/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${calApiKey}`,
      },
      body: JSON.stringify({
        eventTypeId: 3484024,
        start: time,
        responses: { name, email },
        timeZone: "America/New_York",
        language: "en",
      }),
    });

    const calData = await calResponse.json().catch(() => ({}));

    if (!calResponse.ok) {
      console.error("Cal.com API error:", calResponse.status, calData);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to create booking at this time. Please try again or contact support." }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: booking, error: dbError } = await serviceClient
      .from("bookings")
      .insert({
        user_id: userId,
        client_name: name,
        client_email: email,
        appointment_time: time,
        cal_booking_id: calData.id?.toString() || calData.uid || null,
        reminder_sent: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "Booking could not be saved. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, booking }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("create-booking error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred. Please contact support." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
