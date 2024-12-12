import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const Agreement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    businessId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessId) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    navigate("/download");
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center animate-fade-in">
      <Card className="w-full max-w-3xl p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">License Agreement</h1>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms below
          </p>
        </div>

        <Separator />

        <div className="h-64 overflow-y-auto p-4 bg-secondary/50 rounded-lg text-sm">
          <h2 className="font-semibold mb-4">Terms and Conditions</h2>
          <p className="mb-4">
            This License Agreement ("Agreement") is entered into by and between the Licensor and the entity or individual identified below ("Licensee").
          </p>
          <p className="mb-4">
            1. License Grant. Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable license to use the Licensed Material.
          </p>
          <p className="mb-4">
            2. Restrictions. Licensee shall not sublicense, sell, rent, lease, transfer, assign, distribute, or otherwise commercially exploit the Licensed Material.
          </p>
          <p>
            3. Termination. This Agreement is effective until terminated. Licensor may terminate this Agreement at any time if Licensee breaches any provision of this Agreement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessId">Business ID</Label>
              <Input
                id="businessId"
                placeholder="Enter your business ID"
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
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
              />
              <Label htmlFor="accept" className="text-sm">
                I have read and agree to the terms and conditions
              </Label>
            </div>

            <Button type="submit" className="w-full">
              Accept & Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Agreement;