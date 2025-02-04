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

const generatePDF = async (data: AgreementEmailRequest): Promise<Uint8Array> => {
  console.log("Generating PDF for:", data.companyName);
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Embed the default font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set some basic text properties
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  let currentY = height - 50;
  
  // Helper function to add text and move cursor
  const addText = (text: string, isBold = false) => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size: fontSize,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    currentY -= lineHeight;
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
  
  const termsText = `
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

The Material may be used in different formats, including but not limited to video, photo, digital and printed material.`;

  // Split terms text into lines that fit the page width
  const words = termsText.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + word + ' ';
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (textWidth > width - 100) {
      addText(currentLine);
      currentLine = word + ' ';
      
      // Add new page if we're running out of space
      if (currentY < 50) {
        const newPage = pdfDoc.addPage();
        currentY = height - 50;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    addText(currentLine);
  }

  return await pdfDoc.save();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json() as AgreementEmailRequest;
    console.log("Processing email request for:", data.to);

    // Generate PDF
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
    `;

    console.log("Sending email via Resend...");
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