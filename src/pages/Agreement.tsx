import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Agreement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    businessId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessId) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('agreement_acceptances')
        .insert([
          {
            company_name: formData.name,
            business_id: formData.businessId,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Agreement Accepted",
        description: "Your agreement has been recorded successfully.",
      });
      
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
          <h1 className="text-2xl font-semibold tracking-tight">License Agreement</h1>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms below
          </p>
        </div>

        <Separator />

        <div className="h-[60vh] overflow-y-auto p-4 bg-secondary/50 rounded-lg text-sm space-y-6">
          <h2 className="font-semibold text-lg">Guidelines, Terms & Conditions for Sustainable Brand IndexTM Winner / Industry winner badges</h2>
          
          <p>
            As a winning brand (hereinafter referred to as "The Licensee") of Sustainable Brand IndexTM (SBI), either market or industry, you are entitled to purchase a Sustainable Brand IndexTM material (hereinafter referred to as "The Material") to communicate about your win. This means that you – in the annual brand study Sustainable Brand IndexTM – have been perceived as the most sustainable brand in your industry and/or on the market, according to consumers.
          </p>

          <div>
            <h3 className="font-semibold mb-2">THE PURPOSE</h3>
            <p>The Material may be used by winning brands for external and internal commercial reasons to communicate about your performance in SBI, including but not limited to following areas:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Press releases</li>
              <li>Annual & Sustainability reports</li>
              <li>Websites</li>
              <li>Email signatures</li>
              <li>Advertisements</li>
              <li>Brochures</li>
              <li>Newsletters</li>
              <li>Physical communication (Packaging, in store communications etc)</li>
            </ul>
          </div>

          <p>
            The Material may be used in different formats, including but not limited to video, photo, digital and printed material.
          </p>

          <p>
            The Licensee shall not use The Material for any purpose other than The Purpose described in this document. The Licensee may not modify, alter, or create derivative works of The Material or permit anyone else to do so. The Licensee must adhere to the guidelines given by SB Insight (hereinafter referred to as "The Licensor") when using The Material.
          </p>

          <div>
            <h3 className="font-semibold mb-2">REPRISALS IN CASE OF BREACH OF CONTRACT</h3>
            <p>
              If a winning brand does not comply with the guidelines by altering The Material or through misleading or inaccurate communication, The Licensor has the right to contact the company and request changes or removal.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">THE LICENSE PERIOD & FEE</h3>
            <p>
              The right to use The Material is valid for 12 months from the date of signing the agreement (the agreement will be sent to you separately). The use of The Material is subject to a fee based on the annual net turnover of The Licensee in accordance with the following:
            </p>
            <p className="mt-2">
              Company Turnover 1 Brand 2 Brand >3 Brand ≤50millionEUR 3000EUR 4500EUR 6000EUR >50millionEUR 4500EUR 6000EUR 7500EUR
            </p>
            <p className="mt-2">
              If eligible, meaning if The Licensee has been perceived as the most sustainable brand in its industry and/or on its market according to consumers in SBI prior to 2024, The License also gives The Licensee the right to use preceding winner material based on the earlier editions of SBI from 2011 to 2023. For more information, see Guidelines below.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">THE PAYMENT TERMS</h3>
            <p>
              The fee is invoiced in full within two working days from which The Licensee signs this agreement. All prices are stated in the local currency of The Licensee and do not include statutory value-added tax. Terms of payment are net 30 days from invoice date. The Licensor reserves the right to charge late payment interest on any delayed payment.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">MATERIAL DELIVERY</h3>
            <p>
              The Material is delivered to an e-mail address of choice of the Licensee 5 working days after the agreement is signed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">TRADEMARK OWNERSHIP</h3>
            <p>
              The Licensor reserves all rights, title, and interest (including, without limitation, all copyright, trademark, patent, trade secret and all other proprietary rights) in and to The SBI Winner Material.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">INDEMNIFICATION</h3>
            <p>
              The Licensee shall indemnify, defend, and hold harmless The Licensor from and against any and all claims, damages, liabilities, losses, costs and expenses (including reasonable attorney fees) arising out of or related to the breach of The Terms & Conditions by The Licensee.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">APPROVAL OF MATERIAL</h3>
            <p>
              The Licensee is responsible for the content of the material, which is communicated to the market (press releases, product labels, brochures, shelf tags, advertising, etc.) – that is correctly reproduces The Material. The Licensor has the right to pre-approve such communication material where The Material is part of The Licensee´s communication. It is the Licensee's responsibility to follow SB Insight's guidelines when communicating. If the Licensee needs advice or wants to get approval from the Licensor for its communication, the Licensee can request that the Licensor review the communication before publication so that the communication is consistent with applicable laws. The Licensor has 72 hours to respond to The Licensee with approval of the communication material. Should The Licensor not respond within the given timeframe, the communications material can be considered approved.
            </p>
          </div>

          <p>
            See the full guidelines here: <a href="https://www.sb-insight.com/guidelines" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.sb-insight.com/guidelines</a>
          </p>
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