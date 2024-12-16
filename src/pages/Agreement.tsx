import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AgreementContent from "@/components/AgreementContent";

const Agreement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    businessId: "",
    representativeName: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessId || !formData.representativeName || !formData.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const acceptedAt = new Date().toISOString();
      const { error: dbError } = await supabase
        .from('agreement_acceptances')
        .insert([
          {
            company_name: formData.name,
            business_id: formData.businessId,
            representative_name: formData.representativeName,
            email: formData.email,
            accepted_at: acceptedAt,
          }
        ]);

      if (dbError) throw dbError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-agreement-email', {
        body: {
          to: formData.email,
          companyName: formData.name,
          representativeName: formData.representativeName,
          businessId: formData.businessId,
          acceptedAt: acceptedAt,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Agreement Saved",
          description: "Your agreement has been recorded, but there was an issue sending the confirmation email.",
          variant: "default",
        });
      } else {
        toast({
          title: "Agreement Accepted",
          description: "Your agreement has been recorded and a confirmation email has been sent.",
        });
      }
      
      navigate("/download");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "There was an error saving your agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center animate-fade-in">
      <Card className="w-full max-w-4xl p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            License Agreement - Sustainable Brand Index Material
          </h1>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms below
          </p>
        </div>

        <Separator />

        <div className="h-[60vh] overflow-y-auto p-4 bg-secondary/50 rounded-lg text-sm">
          <AgreementContent />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name (Licensee)</Label>
              <Input
                id="name"
                placeholder="Enter company name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessId">Business ID</Label>
              <Input
                id="businessId"
                placeholder="Enter your business ID"
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeName">Name of Representative of Licensee</Label>
              <Input
                id="representativeName"
                placeholder="Enter representative name"
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="accept"
                className="h-4 w-4 rounded border-gray-300"
                required
                disabled={isSubmitting}
              />
              <Label htmlFor="accept" className="text-sm">
                I have read and agree to the terms and conditions
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Accept & Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Agreement;