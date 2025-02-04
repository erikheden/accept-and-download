import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import PDFDocument from "https://esm.sh/pdfkit@0.13.0";
import { Buffer } from "https://deno.land/std@0.170.0/node/buffer.ts";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

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
  invoicingDetails: string;
  brands: string;
}

const generatePDF = async (data: AgreementEmailRequest): Promise<Buffer> => {
  const doc = new PDFDocument();
  const chunks: Uint8Array[] = [];

  // Collect PDF data chunks
  doc.on('data', (chunk) => chunks.push(chunk));
  
  // Add content to PDF
  doc
    .fontSize(20)
    .text('Material License Agreement', { align: 'center' })
    .moveDown()
    .fontSize(12);

  // Add form submission details
  doc
    .text('Agreement Details:', { underline: true })
    .moveDown()
    .text(`Company Name: ${data.companyName}`)
    .text(`Business ID: ${data.businessId}`)
    .text(`Representative Name: ${data.representativeName}`)
    .text(`Brands: ${data.brands}`)
    .text(`Invoicing Details: ${data.invoicingDetails}`)
    .text(`Accepted at: ${new Date(data.acceptedAt).toLocaleString()}`)
    .moveDown()
    .text('Terms and Conditions have been accepted.', { italic: true });

  // Add the full agreement text
  doc
    .moveDown()
    .fontSize(14)
    .text('Agreement Content', { underline: true })
    .moveDown()
    .fontSize(12)
    .text(`
Guidelines, Terms & Conditions for Sustainable Brand IndexTM Winner / Industry winner badges

As a winning brand (hereinafter referred to as "The Licensee") of Sustainable Brand IndexTM (SBI), either market or industry, you are entitled to purchase a Sustainable Brand IndexTM material (hereinafter referred to as "The Material") to communicate about your win. This means that you – in the annual brand study Sustainable Brand IndexTM – have been perceived as the most sustainable brand in your industry and/or on the market, according to consumers.

THE PURPOSE
The Material may be used by winning brands for external and internal commercial reasons to communicate about your performance in SBI, including but not limited to following areas:
• Press releases
• Annual & Sustainability reports
• Websites
• Email signatures
• Advertisements
• Brochures
• Newsletters
• Physical communication (Packaging, in store communications etc)

The Material may be used in different formats, including but not limited to video, photo, digital and printed material.

By accepting this agreement, you confirm that you have read, understood, and agreed to these terms and conditions.`);

  // End the document
  doc.end();

  // Wait for all chunks and combine them
  return Buffer.concat(chunks);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json() as AgreementEmailRequest;
    console.log("Generating PDF for:", data.to);

    // Generate PDF
    const pdfBuffer = await generatePDF(data);
    const pdfBase64 = pdfBuffer.toString('base64');

    const emailHtml = `
      <h1>Agreement Confirmation</h1>
      <p>Dear ${data.representativeName},</p>
      <p>This email confirms that you have accepted the Sustainable Brand Index Material License Agreement on behalf of ${data.companyName}.</p>
      
      <h2>Agreement Details</h2>
      <ul>
        <li>Company Name: ${data.companyName}</li>
        <li>Business ID: ${data.businessId}</li>
        <li>Representative: ${data.representativeName}</li>
        <li>Brands: ${data.brands}</li>
        <li>Invoicing Details: ${data.invoicingDetails}</li>
        <li>Accepted at: ${new Date(data.acceptedAt).toLocaleString()}</li>
      </ul>

      <p>Please find attached a PDF copy of your signed agreement.</p>
      <p>For more information about the guidelines, please visit: <a href="https://www.sb-insight.com/guidelines">https://www.sb-insight.com/guidelines</a></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sustainable Brand Index <no-reply@resend.dev>",
      to: [data.to],
      subject: "Agreement Confirmation - Sustainable Brand Index",
      html: emailHtml,
      attachments: [{
        filename: 'agreement.pdf',
        content: pdfBase64
      }]
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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