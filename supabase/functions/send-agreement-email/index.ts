import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgreementEmailRequest {
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
    const { to, companyName, representativeName, businessId, acceptedAt } = 
      await req.json() as AgreementEmailRequest;

    console.log("Sending agreement email to:", to);

    const emailHtml = `
      <h1>Agreement Confirmation</h1>
      <p>Dear ${representativeName},</p>
      <p>This email confirms that you have accepted the Sustainable Brand Index Material License Agreement on behalf of ${companyName}.</p>
      
      <h2>Agreement Details</h2>
      <ul>
        <li>Company Name: ${companyName}</li>
        <li>Business ID: ${businessId}</li>
        <li>Representative: ${representativeName}</li>
        <li>Accepted at: ${new Date(acceptedAt).toLocaleString()}</li>
      </ul>

      <h2>Agreement Content</h2>
      <div>
        <h3>Guidelines, Terms & Conditions for Sustainable Brand IndexTM Winner / Industry winner badges</h3>
        
        <p>As a winning brand (hereinafter referred to as "The Licensee") of Sustainable Brand IndexTM (SBI), either market or industry, you are entitled to purchase a Sustainable Brand IndexTM material (hereinafter referred to as "The Material") to communicate about your win. This means that you – in the annual brand study Sustainable Brand IndexTM – have been perceived as the most sustainable brand in your industry and/or on the market, according to consumers.</p>

        <h3>THE PURPOSE</h3>
        <p>The Material may be used by winning brands for external and internal commercial reasons to communicate about your performance in SBI, including but not limited to following areas:</p>
        <ul>
          <li>Press releases</li>
          <li>Annual & Sustainability reports</li>
          <li>Websites</li>
          <li>Email signatures</li>
          <li>Advertisements</li>
          <li>Brochures</li>
          <li>Newsletters</li>
          <li>Physical communication (Packaging, in store communications etc)</li>
        </ul>

        <p>The Material may be used in different formats, including but not limited to video, photo, digital and printed material.</p>

        <p>The Licensee shall not use The Material for any purpose other than The Purpose described in this document. The Licensee may not modify, alter, or create derivative works of The Material or permit anyone else to do so. The Licensee must adhere to the guidelines given by SB Insight (hereinafter referred to as "The Licensor") when using The Material.</p>

        <h3>REPRISALS IN CASE OF BREACH OF CONTRACT</h3>
        <p>If a winning brand does not comply with the guidelines by altering The Material or through misleading or inaccurate communication, The Licensor has the right to contact the company and request changes or removal.</p>

        <h3>THE LICENSE PERIOD & FEE</h3>
        <p>The right to use The Material is valid for 12 months from the date of accepting this Agreement. The use of The Material is subject to a fee based on the annual net turnover of The Licensee.</p>

        <h3>THE PAYMENT TERMS</h3>
        <p>The fee is invoiced in full within two working days from which The Licensee signs this agreement. All prices are stated in the local currency of The Licensee and do not include statutory value-added tax. Terms of payment are net 30 days from invoice date. The Licensor reserves the right to charge late payment interest on any delayed payment.</p>

        <h3>MATERIAL DELIVERY</h3>
        <p>The Material will be available directly after signing this Agreement.</p>

        <h3>TRADEMARK OWNERSHIP</h3>
        <p>The Licensor reserves all rights, title, and interest (including, without limitation, all copyright, trademark, patent, trade secret and all other proprietary rights) in and to The SBI Winner Material.</p>

        <h3>INDEMNIFICATION</h3>
        <p>The Licensee shall indemnify, defend, and hold harmless The Licensor from and against any and all claims, damages, liabilities, losses, costs and expenses (including reasonable attorney fees) arising out of or related to the breach of The Terms & Conditions by The Licensee.</p>

        <h3>APPROVAL OF MATERIAL</h3>
        <p>The Licensee is responsible for the content of the material, which is communicated to the market (press releases, product labels, brochures, shelf tags, advertising, etc.) – that is correctly reproduces The Material. The Licensor has the right to pre-approve such communication material where The Material is part of The Licensee´s communication. It is the Licensee's responsibility to follow SB Insight's guidelines when communicating. If the Licensee needs advice or wants to get approval from the Licensor for its communication, the Licensee can request that the Licensor review the communication before publication so that the communication is consistent with applicable laws. The Licensor has 72 hours to respond to The Licensee with approval of the communication material. Should The Licensor not respond within the given timeframe, the communications material can be considered approved.</p>
      </div>

      <p>Please keep this email for your records.</p>
      <p>For more information about the guidelines, please visit: <a href="https://www.sb-insight.com/guidelines">https://www.sb-insight.com/guidelines</a></p>
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

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-agreement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);