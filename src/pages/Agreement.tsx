import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AgreementContent from "@/components/AgreementContent";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  businessId: z.string().min(1, "Business ID is required"),
  representativeName: z.string().min(1, "Representative name is required"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

const Agreement = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      businessId: "",
      representativeName: "",
      email: "",
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
          },
        }
      );

      if (emailError) {
        console.error("Error sending email:", emailError);
        toast.error("Agreement saved but failed to send confirmation email");
      } else {
        toast.success("Agreement accepted and confirmation email sent");
      }

      navigate("/download");
    } catch (error) {
      console.error("Error submitting agreement:", error);
      toast.error("Failed to submit agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <div className="prose max-w-none">
        <h1>Material License Agreement</h1>
        <AgreementContent />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
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
                <FormLabel>Business ID</FormLabel>
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
                <FormLabel>Representative Name</FormLabel>
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Accept Agreement"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Agreement;