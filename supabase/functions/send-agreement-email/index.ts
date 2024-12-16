import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  companyName: string;
  representativeName: string;
  businessId: string;
  acceptedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, companyName, representativeName, businessId, acceptedAt } = await req.json() as EmailRequest;

    const emailHtml = `
      <h1>Agreement Confirmation</h1>
      <p>Dear ${representativeName},</p>
      <p>This email confirms that you have accepted the Sustainable Brand Index Material License Agreement on behalf of ${companyName}.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Company Name: ${companyName}</li>
        <li>Business ID: ${businessId}</li>
        <li>Representative: ${representativeName}</li>
        <li>Accepted at: ${new Date(acceptedAt).toLocaleString()}</li>
      </ul>
      <p>Please keep this email for your records.</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sustainable Brand Index <no-reply@resend.dev>",
        to: [to],
        subject: "Agreement Confirmation - Sustainable Brand Index",
        html: emailHtml,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);