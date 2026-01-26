import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  name: string;
  email: string;
  time: string; // ISO 8601 format
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, time }: BookingRequest = await req.json();

    // Validate required fields
    if (!name || !email || !time) {
      throw new Error("Missing required fields: name, email, and time are required");
    }

    console.log(`Creating booking for ${name} (${email}) at ${time}`);

    const calApiKey = Deno.env.get("CAL_API_KEY");
    if (!calApiKey) {
      throw new Error("CAL_API_KEY is not configured");
    }

    // Call Cal.com API to create the booking
    const calResponse = await fetch("https://api.cal.com/v1/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${calApiKey}`,
      },
      body: JSON.stringify({
        eventTypeId: 3484024,
        start: time,
        responses: {
          name: name,
          email: email,
        },
        timeZone: "America/New_York",
        language: "en",
      }),
    });

    const calData = await calResponse.json();

    if (!calResponse.ok) {
      console.error("Cal.com API error:", calData);
      throw new Error(`Cal.com booking failed: ${calData.message || "Unknown error"}`);
    }

    console.log("Cal.com booking created:", calData);

    // Insert booking into Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: dbError } = await supabase
      .from("bookings")
      .insert({
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
      throw new Error(`Failed to save booking: ${dbError.message}`);
    }

    console.log("Booking saved to database:", booking);

    return new Response(
      JSON.stringify({
        success: true,
        booking: booking,
        calBooking: calData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-booking function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
