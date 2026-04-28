import DashboardDataChart from "./dashboard-data-chart";
import DashboardSummary from "./dashboard-summary";
import PageLayout from "@/components/page-layout";
//import ExpenseBreakDown from "./expense-breakdown";
import ExpensePieChart from "./expense-pie-chart";
import DashboardRecentTransactions from "./dashboard-recent-transactions";
import { useState } from "react";
import { DateRangeType } from "@/components/date-range-select";
import BudgetProgressCard from "./_component/budget-progress-card";
import { DashboardCoachCard } from "@/components/dashboard-coach/dashboard-coach-card";
import GoalsSummary from "./_component/goals-summary";

const Dashboard = () => {
  const [dateRange, _setDateRange] = useState<DateRangeType>(null);

  return (
    <div className="w-full flex flex-col">
      {/* Dashboard Summary Overview */}
      <PageLayout
        className="space-y-6"
        renderPageHeader={
          <DashboardSummary
            dateRange={dateRange}
            setDateRange={_setDateRange}
          />
        }
      >
        {/* Dashboard Main Section */}
        <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-4">
            <DashboardDataChart dateRange={dateRange} />
          </div>
          <div className="lg:col-span-2">
            <ExpensePieChart dateRange={dateRange} />
          </div>
        </div>
        <div className="w-full">
          <BudgetProgressCard />
        </div>
        <div className="w-full mt-4">
          <GoalsSummary />
        </div>
        {/* AI Financial Coach */}
        <div className="w-full">
          <DashboardCoachCard
            preset={dateRange?.value}
            from={dateRange?.from ? dateRange.from.toISOString() : undefined}
            to={dateRange?.to ? dateRange.to.toISOString() : undefined}
          />
        </div>
        {/* Dashboard Recent Transactions */}
        <div className="w-full mt-0">
          <DashboardRecentTransactions />
        </div>
      </PageLayout>
    </div>
  );
};

export default Dashboard;
