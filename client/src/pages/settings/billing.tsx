import { Separator } from "@/components/ui/separator";

const Billing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>
      <Separator />

      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6">
        <h1 className="text-lg font-medium mb-2">
          Billing feature is under development
        </h1>
        <p className="text-sm text-muted-foreground">
          This section will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default Billing;
