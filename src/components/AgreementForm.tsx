import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { agreementFormSchema, type AgreementFormData } from "./agreement/agreement-schema";
import { AgreementFormFields } from "./agreement/AgreementFormFields";
import { useAgreementSubmit } from "./agreement/useAgreementSubmit";

export const AgreementForm = () => {
  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      companyName: "",
      businessId: "",
      representativeName: "",
      email: "",
      invoicingDetails: "",
      acceptTerms: false,
    },
  });

  const { handleSubmit, isSubmitting } = useAgreementSubmit();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <AgreementFormFields form={form} />

        <p className="text-sm text-muted-foreground">
          After accepting the Terms and Conditions, a copy of this agreement will be sent to your email.
        </p>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Accept Agreement"}
        </Button>
      </form>
    </Form>
  );
};