import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AgreementFormData } from "../agreement-schema";

interface RepresentativeSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export const RepresentativeSection = ({ form }: RepresentativeSectionProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="representativeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Representative Name *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address *</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};