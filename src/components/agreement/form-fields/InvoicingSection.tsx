import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { AgreementFormData } from "../agreement-schema";

interface InvoicingSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export const InvoicingSection = ({ form }: InvoicingSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="invoicingDetails"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Invoicing Details (Invoicing address and email, Cost Centre etc.) *</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};