import { UseFormReturn } from "react-hook-form";
import { AgreementFormData } from "./agreement-schema";
import { CompanySection } from "./form-fields/CompanySection";
import { RepresentativeSection } from "./form-fields/RepresentativeSection";
import { InvoicingSection } from "./form-fields/InvoicingSection";
import { TermsSection } from "./form-fields/TermsSection";

interface AgreementFormFieldsProps {
  form: UseFormReturn<AgreementFormData>;
}

export const AgreementFormFields = ({ form }: AgreementFormFieldsProps) => {
  return (
    <>
      <CompanySection form={form} />
      <RepresentativeSection form={form} />
      <InvoicingSection form={form} />
      <TermsSection form={form} />
    </>
  );
};