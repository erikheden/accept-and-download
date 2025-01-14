import { AgreementForm } from "@/components/AgreementForm";
import AgreementContent from "@/components/AgreementContent";

const Agreement = () => {
  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <div className="prose max-w-none">
        <h1>Material License Agreement</h1>
        <AgreementContent />
      </div>
      <AgreementForm />
    </div>
  );
};

export default Agreement;