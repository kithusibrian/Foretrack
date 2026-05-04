import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/page-layout";
import ScheduleReportDrawer from "./_component/schedule-report-drawer";
import ReportTable from "./_component/report-table";
import ManualReportButton from "./_component/manual-report-button";

export default function Reports() {
  return (
    <PageLayout
      title="Report History"
      subtitle="View and manage your financial reports"
      addMarginTop
      rightAction={
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-start sm:justify-end">
          <ManualReportButton />
          <ScheduleReportDrawer />
        </div>
      }
    >
      <Card className="border shadow-none">
        <CardContent>
          <ReportTable />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
