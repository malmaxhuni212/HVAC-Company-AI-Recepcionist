import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reminder check...");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the time window: appointments between 23-25 hours from now
    const now = new Date();
    const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    console.log(`Looking for appointments between ${twentyThreeHoursFromNow.toISOString()} and ${twentyFiveHoursFromNow.toISOString()}`);

    // Query bookings that need reminders
    const { data: bookings, error: queryError } = await supabase
      .from("bookings")
      .select("*")
      .eq("reminder_sent", false)
      .gte("appointment_time", twentyThreeHoursFromNow.toISOString())
      .lte("appointment_time", twentyFiveHoursFromNow.toISOString());

    if (queryError) {
      console.error("Database query error:", queryError);
      throw new Error(`Failed to query bookings: ${queryError.message}`);
    }

    console.log(`Found ${bookings?.length || 0} bookings needing reminders`);

    const results = [];

    for (const booking of bookings || []) {
      try {
        // Format the appointment date and time
        const appointmentDate = new Date(booking.appointment_time);
        const formattedDate = appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        console.log(`Sending reminder to ${booking.client_email} for appointment on ${formattedDate} at ${formattedTime}`);

        // Send the reminder email
        const emailResponse = await resend.emails.send({
          from: "Metro Heating <noreply@metroheating.lovable.app>",
          to: [booking.client_email],
          subject: "Tomorrow: Your Service Appointment",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Appointment Reminder</h2>
              <p>Hi ${booking.client_name},</p>
              <p>Quick reminder - we're scheduled to come out tomorrow:</p>
              <p style="font-size: 18px; font-weight: bold; color: #2563eb;">
                ${formattedDate} at ${formattedTime}
              </p>
              <p>Please ensure someone 18+ is home and pets are secured.</p>
              <p>Thanks,<br/>Metro Heating</p>
            </div>
          `,
        });

        console.log(`Email sent successfully to ${booking.client_email}:`, emailResponse);

        // Update the booking to mark reminder as sent
        const { error: updateError } = await supabase
          .from("bookings")
          .update({ reminder_sent: true })
          .eq("id", booking.id);

        if (updateError) {
          console.error(`Failed to update reminder_sent for booking ${booking.id}:`, updateError);
        } else {
          console.log(`Marked reminder_sent = true for booking ${booking.id}`);
        }

        results.push({
          id: booking.id,
          email: booking.client_email,
          status: "sent",
        });
      } catch (emailError: any) {
        console.error(`Failed to send reminder to ${booking.client_email}:`, emailError);
        results.push({
          id: booking.id,
          email: booking.client_email,
          status: "failed",
          error: emailError.message,
        });
      }
    }

    console.log("Reminder processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reminders function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
