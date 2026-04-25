export interface BudgetFilterParams {
  month?: number;
  year?: number;
  alertThreshold?: number;
}

export interface BudgetAlertItem {
  id: string;
  category: string;
  status: "ON_TRACK" | "NEAR_LIMIT" | "OVER_LIMIT";
  remainingAmount: number;
  usedPercentage: number;
  message: string | null;
}

export interface BudgetItem {
  id: string;
  category: string;
  month: number;
  year: number;
  period: "MONTHLY";
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usedPercentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  alertStatus: "ON_TRACK" | "NEAR_LIMIT" | "OVER_LIMIT";
  alertMessage: string | null;
}

export interface BudgetSummary {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  usagePercentage: number;
  alertThreshold: number;
  overLimitCount: number;
  nearLimitCount: number;
  hasAlerts: boolean;
}

export interface BudgetProgressResponse {
  message: string;
  data: {
    budgets: BudgetItem[];
    alerts: BudgetAlertItem[];
    summary: BudgetSummary;
    period: {
      month: number;
      year: number;
      period: "MONTHLY";
      from: string;
      to: string;
    };
  };
}

export interface BudgetListResponse {
  message: string;
  data: {
    budgets: Array<{
      _id: string;
      category: string;
      period: "MONTHLY";
      month: number;
      year: number;
      limitAmount: number;
    }>;
    period: {
      month: number;
      year: number;
      period: "MONTHLY";
    };
  };
}

export interface CreateBudgetBody {
  category: string;
  limitAmount: number;
  period: "MONTHLY";
  month: number;
  year: number;
}

export interface UpdateBudgetPayload {
  id: string;
  body: Partial<CreateBudgetBody>;
}
