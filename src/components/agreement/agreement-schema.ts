import { z } from "zod";

export const agreementFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  businessId: z.string().min(1, "Business ID is required"),
  brands: z.string().min(1, "Brand information is required"),
  representativeName: z.string().min(1, "Representative name is required"),
  email: z.string().email("Invalid email address"),
  invoicingDetails: z.string().min(1, "Invoicing details are required"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions",
  }),
});

export type AgreementFormData = z.infer<typeof agreementFormSchema>;