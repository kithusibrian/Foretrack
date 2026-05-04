import { useGenerateManualReportMutation } from "@/features/report/reportAPI";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const MANUAL_REPORT_TRIGGER_AT_KEY = "manual_report_triggered_at";

const ManualReportButton = () => {
  const [generateManualReport, { isLoading }] =
    useGenerateManualReportMutation();
  const [lastTriggeredAt, setLastTriggeredAt] = useState<string | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem(MANUAL_REPORT_TRIGGER_AT_KEY);
    if (storedValue) setLastTriggeredAt(storedValue);
  }, []);

  const handleGenerate = () => {
    generateManualReport({})
      .unwrap()
      .then((response) => {
        const now = new Date().toISOString();
        localStorage.setItem(MANUAL_REPORT_TRIGGER_AT_KEY, now);
        setLastTriggeredAt(now);
        toast.success(response.message || "Report request sent successfully");
      })
      .catch((error) => {
        toast.error(
          error?.data?.message || "Failed to trigger report generation",
        );
      });
  };

  return (
    <div className="flex w-full flex-col items-start gap-1 sm:w-auto sm:items-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send missed report
      </Button>

      <p className="text-[11px] leading-tight text-muted-foreground sm:text-right sm:text-xs">
        {lastTriggeredAt
          ? `Last manual trigger at ${format(new Date(lastTriggeredAt), "MMM d, yyyy h:mm a")}`
          : "Last manual trigger: Never"}
      </p>
    </div>
  );
};

export default ManualReportButton;
