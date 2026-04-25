import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BellRing, Pencil, Trash2 } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetProgressQuery,
  useUpdateBudgetMutation,
} from "@/features/budget/budgetAPI";
import { BudgetItem } from "@/features/budget/budgetType";

const ALERT_THRESHOLD = 80;

const formatCategoryLabel = (category: string) =>
  category
    .split(" ")
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const yearOptions = Array.from(
  { length: 7 },
  (_, index) => new Date().getFullYear() - 2 + index,
);

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    return data?.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
};

const Budgets = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    now.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState<string>("");
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);

  const { data, isFetching } = useGetBudgetProgressQuery({
    month: selectedMonth,
    year: selectedYear,
    alertThreshold: ALERT_THRESHOLD,
  });

  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation();
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation();
  const [deleteBudget, { isLoading: isDeleting }] = useDeleteBudgetMutation();

  const budgets = data?.data?.budgets || [];
  const alerts = data?.data?.alerts || [];
  const summary = data?.data?.summary;

  const isSubmitting = isCreating || isUpdating;

  const formTitle = editingBudget ? "Edit Budget" : "Create Budget";

  const canSubmit = useMemo(() => {
    const amount = Number(limitAmount);
    return category.trim().length > 0 && Number.isFinite(amount) && amount > 0;
  }, [category, limitAmount]);

  const resetForm = () => {
    setCategory("");
    setLimitAmount("");
    setEditingBudget(null);
  };

  const handleEdit = (budget: BudgetItem) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setLimitAmount(String(budget.limitAmount));
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId).unwrap();
      toast.success("Budget deleted successfully");
      if (editingBudget?.id === budgetId) {
        resetForm();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      const payload = {
        category: category.trim(),
        limitAmount: Number(limitAmount),
        period: "MONTHLY" as const,
        month: selectedMonth,
        year: selectedYear,
      };

      if (editingBudget) {
        await updateBudget({ id: editingBudget.id, body: payload }).unwrap();
        toast.success("Budget updated successfully");
      } else {
        await createBudget(payload).unwrap();
        toast.success("Budget created successfully");
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageLayout
      title="Budget Planner"
      subtitle="Set monthly category limits and track your spending against each budget."
      addMarginTop
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle>{formTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem value={String(index + 1)} key={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem value={String(year)} key={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget-category">Category</Label>
                <Input
                  id="budget-category"
                  placeholder="e.g. Groceries"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget-limit">Budget Amount (KES)</Label>
                <Input
                  id="budget-limit"
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="5000"
                  value={limitAmount}
                  onChange={(event) => setLimitAmount(event.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </Button>
                {editingBudget && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {alerts.length > 0 && (
            <Card className="border shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BellRing className="h-4 w-4" />
                  Budget Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={
                      alert.status === "OVER_LIMIT"
                        ? "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        : "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCategoryLabel(alert.category)}
                      </span>
                      <span className="text-xs">
                        {alert.status === "OVER_LIMIT"
                          ? "Over Budget"
                          : `Near Limit (${summary?.alertThreshold || ALERT_THRESHOLD}%+)`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs">
                      {alert.status === "OVER_LIMIT"
                        ? `${formatCurrency(Math.abs(alert.remainingAmount))} above limit.`
                        : `${alert.usedPercentage.toFixed(1)}% used so far.`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border shadow-none">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(summary?.totalLimit || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(summary?.totalSpent || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(summary?.totalRemaining || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alert Status</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {summary?.overLimitCount || 0} over,{" "}
                    {summary?.nearLimitCount || 0} near limit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-none">
            <CardHeader>
              <CardTitle>
                {monthNames[selectedMonth - 1]} {selectedYear} Budgets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFetching ? (
                <p className="text-sm text-muted-foreground">
                  Loading budgets...
                </p>
              ) : budgets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No budgets found for this month yet. Add your first budget on
                  the left.
                </p>
              ) : (
                budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className={
                      budget.isOverBudget
                        ? "rounded-lg border border-red-200 bg-red-50/40 p-4"
                        : budget.isNearLimit
                          ? "rounded-lg border border-amber-200 bg-amber-50/40 p-4"
                          : "rounded-lg border p-4"
                    }
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {formatCategoryLabel(budget.category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(budget.spentAmount)} spent of{" "}
                          {formatCurrency(budget.limitAmount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(budget)}
                          aria-label={`Edit ${budget.category} budget`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(budget.id)}
                          disabled={isDeleting}
                          aria-label={`Delete ${budget.category} budget`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={
                          budget.isOverBudget
                            ? "text-red-600"
                            : budget.isNearLimit
                              ? "text-amber-700"
                              : "text-muted-foreground"
                        }
                      >
                        {budget.usedPercentage.toFixed(1)}% used
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
                        {budget.isOverBudget
                          ? `${formatCurrency(Math.abs(budget.remainingAmount))} over budget`
                          : `${formatCurrency(budget.remainingAmount)} remaining`}
                      </span>
                    </div>

                    {budget.alertStatus !== "ON_TRACK" &&
                      budget.alertMessage && (
                        <p
                          className={
                            budget.isOverBudget
                              ? "mt-2 text-xs text-red-700"
                              : "mt-2 text-xs text-amber-700"
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
        </div>
      </div>
    </PageLayout>
  );
};

export default Budgets;
