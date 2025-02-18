
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set");
}
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

const sanitizeText = (text: string): string => {
  // Replace problematic characters and normalize line breaks
  return text.replace(/[\n\r]+/g, ' ').trim();
};

const generatePDF = async (data: AgreementEmailRequest): Promise<Uint8Array> => {
  console.log("Generating PDF for:", data.companyName);
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  let currentY = height - 50;
  
  const addText = (text: string, isBold = false, indent = 0) => {
    const sanitizedText = sanitizeText(text);
    const maxWidth = width - 100 - indent;
    const words = sanitizedText.split(' ');
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const textWidth = (isBold ? boldFont : font).widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth) {
        page.drawText(sanitizeText(currentLine), {
          x: 50 + indent,
          y: currentY,
          size: fontSize,
          font: isBold ? boldFont : font,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      page.drawText(sanitizeText(currentLine), {
        x: 50 + indent,
        y: currentY,
        size: fontSize,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
      currentY -= lineHeight;
    }
  };
  
  // Add title
  page.drawText('Material License Agreement', {
    x: 50,
    y: height - 50,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  currentY -= lineHeight * 2;
  
  // Add form submission details
  addText('Agreement Details:', true);
  currentY -= lineHeight;
  addText(`Company Name: ${data.companyName}`);
  addText(`Business ID: ${data.businessId}`);
  addText(`Representative Name: ${data.representativeName}`);
  addText(`Brands: ${data.brands}`);
  addText(`Invoicing Details: ${data.invoicingDetails}`);
  addText(`Accepted at: ${new Date(data.acceptedAt).toLocaleString()}`);
  currentY -= lineHeight;
  
  // Add terms text
  addText('Terms and Conditions', true);
  currentY -= lineHeight;
  
  const termsText = `Guidelines, Terms & Conditions for Sustainable Brand IndexTM Winner / Industry winner badges

As a winning brand of Sustainable Brand IndexTM (SBI), either market or industry, you are entitled to purchase a Sustainable Brand IndexTM material to communicate about your win. This means that you have been perceived as the most sustainable brand in your industry and/or on the market, according to consumers.

The Material may be used by winning brands for external and internal commercial reasons to communicate about your performance in SBI, including but not limited to press releases, annual & sustainability reports, websites, email signatures, advertisements, brochures, newsletters, and physical communication.`;

  addText(termsText);

  return await pdfDoc.save();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json() as AgreementEmailRequest;
    console.log("Processing email request for:", data.to);

    const pdfBytes = await generatePDF(data);
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
    console.log("PDF generated successfully");

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
      <p>Link to download the material: <a href="https://www.sb-insight.com/download-sbi-material">https://www.sb-insight.com/download-sbi-material</a></p>
    `;

    console.log("Sending emails via Resend...");
    
    // Send both emails in parallel
    const [userEmailResponse, notificationEmailResponse] = await Promise.all([
      // User email
      resend.emails.send({
        from: "Sustainable Brand Index <no-reply@updates.sb-insight.com>",
        to: [data.to],
        subject: "Agreement Confirmation - Sustainable Brand Index",
        html: emailHtml,
        attachments: [{
          filename: 'agreement.pdf',
          content: pdfBase64
        }]
      }),
      // Admin notification email
      resend.emails.send({
        from: "Sustainable Brand Index <no-reply@updates.sb-insight.com>",
        to: ["erik.heden@sb-insight.com"],
        subject: `New Agreement Acceptance - ${data.companyName}`,
        html: emailHtml,
        attachments: [{
          filename: 'agreement.pdf',
          content: pdfBase64
        }]
      })
    ]);

    console.log("Emails sent successfully:", {
      userEmail: userEmailResponse,
      notificationEmail: notificationEmailResponse
    });

    return new Response(JSON.stringify({ 
      message: "Agreement processed successfully",
      userEmail: userEmailResponse,
      notificationEmail: notificationEmailResponse 
    }), {
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
