import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgreementFormData } from "./agreement-schema";

export const useAgreementSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AgreementFormData) => {
    try {
      setIsSubmitting(true);
      const acceptedAt = new Date().toISOString();

      // Save to database
      const { error: dbError } = await supabase
        .from("agreement_acceptances")
        .insert({
          company_name: data.companyName,
          business_id: data.businessId,
          representative_name: data.representativeName,
          email: data.email,
          accepted_at: acceptedAt,
        });

      if (dbError) throw dbError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-agreement-email",
        {
          body: {
            to: data.email,
            companyName: data.companyName,
            representativeName: data.representativeName,
            businessId: data.businessId,
            acceptedAt: acceptedAt,
            invoicingDetails: data.invoicingDetails,
          },
        }
      );

      if (emailError) {
        console.error("Error sending email:", emailError);
        toast.error("Agreement saved but failed to send confirmation email");
      } else {
        toast.success("Agreement accepted and confirmation email sent");
      }

      // Redirect to external download page
      window.location.href = "https://sb-insight.com/download-badges";
    } catch (error) {
      console.error("Error submitting agreement:", error);
      toast.error("Failed to submit agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};