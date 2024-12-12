import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const Download = () => {
  const handleDownload = () => {
    // Replace with actual download URL
    window.location.href = "https://example.com/download";
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center animate-fade-in">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Agreement Accepted</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for accepting the license agreement. You can now download the licensed material.
          </p>
        </div>

        <Button onClick={handleDownload} className="w-full">
          Download Licensed Material
        </Button>
      </Card>
    </div>
  );
};

export default Download;