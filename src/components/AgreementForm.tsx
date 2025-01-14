import { z } from "zod";
import { useState } from "react"; // Added this import
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  businessId: z.string().min(1, "Business ID is required"),
  representativeName: z.string().min(1, "Representative name is required"),
  email: z.string().email("Invalid email address"),
  invoicingDetails: z.string().min(1, "Invoicing details are required"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the agreement terms",
  }),
});

type FormData = z.infer<typeof formSchema>;

export const AgreementForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      businessId: "",
      representativeName: "",
      email: "",
      invoicingDetails: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: FormData) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business ID *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  I accept the terms and conditions of this agreement *
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-sm text-muted-foreground">
          After accepting the terms and conditions, a copy of this agreement will be sent to your email.
        </p>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Accept Agreement"}
        </Button>
      </form>
    </Form>
  );
};