import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format-currency";
import { useGetBudgetProgressQuery } from "@/features/budget/budgetAPI";

const ALERT_THRESHOLD = 80;

const formatCategoryLabel = (category: string) =>
  category
    .split(" ")
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

const BudgetProgressCard = () => {
  const now = useMemo(() => new Date(), []);

  const { data, isFetching } = useGetBudgetProgressQuery({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    alertThreshold: ALERT_THRESHOLD,
  });

  const budgets = data?.data?.budgets || [];
  const summary = data?.data?.summary;

  return (
    <Card className="border shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!!summary?.hasAlerts && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {summary.overLimitCount} over budget, {summary.nearLimitCount}{" "}
                near limit
              </span>
            </div>
          </div>
        )}

        {isFetching ? (
          <p className="text-sm text-muted-foreground">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No budgets set for this month. Add one from the Budgets page.
          </p>
        ) : (
          budgets.slice(0, 3).map((budget) => (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {formatCategoryLabel(budget.category)}
                </span>
                <span
                  className={
                    budget.isOverBudget
                      ? "text-red-600"
                      : budget.isNearLimit
                        ? "text-amber-700"
                        : "text-muted-foreground"
                  }
                >
                  {formatCurrency(budget.spentAmount)} /{" "}
                  {formatCurrency(budget.limitAmount)}
                </span>
              </div>

              <Progress
                value={Math.min(budget.usedPercentage, 100)}
                className={
                  budget.isOverBudget
                    ? "[&_[data-slot=progress-indicator]]:bg-red-500"
                    : budget.isNearLimit
                      ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                      : ""
                }
              />

              {budget.alertStatus !== "ON_TRACK" && budget.alertMessage && (
                <p
                  className={
                    budget.isOverBudget
                      ? "text-xs text-red-700"
                      : "text-xs text-amber-700"
                  }
                >
                  {budget.alertMessage}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgressCard;
