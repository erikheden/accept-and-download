
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgreementFormData } from "./agreement-schema";

export const useAgreementSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AgreementFormData) => {
    console.log("Starting form submission with data:", {
      ...data,
      email: "REDACTED", // Don't log email for privacy
    });
    
    try {
      setIsSubmitting(true);
      const acceptedAt = new Date().toISOString();

      // Save to database with all fields
      const { data: insertedData, error: dbError } = await supabase
        .from("agreement_acceptances")
        .insert({
          company_name: data.companyName,
          business_id: data.businessId,
          representative_name: data.representativeName,
          email: data.email,
          accepted_at: acceptedAt,
          brands: data.brands,
          invoicing_details: data.invoicingDetails,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Failed to save agreement: ${dbError.message}`);
      }

      console.log("Agreement saved successfully, sending confirmation email...");

      // Send confirmation email with PDF
      const { data: emailData, error: emailError } = await supabase.functions.invoke("send-agreement-email", {
        body: {
          to: data.email,
          companyName: data.companyName,
          representativeName: data.representativeName,
          businessId: data.businessId,
          acceptedAt: acceptedAt,
          invoicingDetails: data.invoicingDetails,
          brands: data.brands,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw here, just show a warning toast
        toast.warning("Agreement saved but failed to send confirmation email. Our team will send it manually.");
      } else {
        console.log("Email sent successfully");
        toast.success("Agreement accepted and confirmation email sent");
      }

      // Continue with redirect even if email fails
      console.log("Redirecting to download page...");
      window.top.location.href = "https://www.sb-insight.com/download-sbi-material";
    } catch (error) {
      console.error("Error in form submission:", error);
      // Show a more detailed error message to the user
      toast.error(`Failed to submit agreement: ${error.message || 'Unknown error occurred'}`);
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
