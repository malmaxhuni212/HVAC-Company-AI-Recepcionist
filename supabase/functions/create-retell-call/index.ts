import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_ID = "agent_f82b736178f296d4b58bc3589c";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional auth: validate JWT if provided, but don't require it (public voice widget)
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
      );
      const token = authHeader.replace("Bearer ", "");
      await supabase.auth.getClaims(token).catch(() => null);
    }

    const retellApiKey = Deno.env.get("RETELL_API_KEY");
    if (!retellApiKey) {
      console.error("RETELL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Voice service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${retellApiKey}`,
      },
      body: JSON.stringify({ agent_id: AGENT_ID }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Retell API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Unable to start call" }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ access_token: data.access_token }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("create-retell-call error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to start call" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
