import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AgreementFormData } from "../agreement-schema";

interface TermsSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export const TermsSection = ({ form }: TermsSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="acceptTerms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>
              I accept the Terms and Conditions of this agreement *
            </FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};