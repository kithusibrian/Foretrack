import mongoose from "mongoose";
import { endOfMonth, startOfMonth } from "date-fns";
import BudgetModel, { BudgetPeriodEnum } from "../models/budget.model";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  BudgetFilterType,
  CreateBudgetType,
  UpdateBudgetType,
} from "../validators/budget.validator";

const normalizeCategory = (category: string) => category.trim().toLowerCase();

const getEffectiveMonthYear = (filter?: BudgetFilterType) => {
  const now = new Date();
  return {
    month: filter?.month ?? now.getMonth() + 1,
    year: filter?.year ?? now.getFullYear(),
  };
};

const getMonthDateRange = (month: number, year: number) => {
  const monthDate = new Date(year, month - 1, 1);
  return {
    from: startOfMonth(monthDate),
    to: endOfMonth(monthDate),
  };
};

export const createBudgetService = async (
  userId: string,
  body: CreateBudgetType,
) => {
  const normalizedCategory = normalizeCategory(body.category);

  const existingBudget = await BudgetModel.findOne({
    userId,
    category: normalizedCategory,
    period: body.period,
    month: body.month,
    year: body.year,
  });

  if (existingBudget)
    throw new BadRequestException(
      "A budget already exists for this category and period",
    );

  const budget = await BudgetModel.create({
    ...body,
    category: normalizedCategory,
    userId,
  });

  return budget;
};

export const getAllBudgetsService = async (
  userId: string,
  filter?: BudgetFilterType,
) => {
  const { month, year } = getEffectiveMonthYear(filter);

  const budgets = await BudgetModel.find({
    userId,
    month,
    year,
    period: BudgetPeriodEnum.MONTHLY,
  }).sort({ category: 1 });

  return {
    budgets,
    period: {
      month,
      year,
      period: BudgetPeriodEnum.MONTHLY,
    },
  };
};

export const updateBudgetService = async (
  userId: string,
  budgetId: string,
  body: UpdateBudgetType,
) => {
  const budget = await BudgetModel.findOne({
    _id: budgetId,
    userId,
  });

  if (!budget) throw new NotFoundException("Budget not found");

  const nextCategory = body.category ?? budget.category;
  const nextPeriod = body.period ?? budget.period;
  const nextMonth = body.month ?? budget.month;
  const nextYear = body.year ?? budget.year;
  const normalizedCategory = normalizeCategory(nextCategory);

  const duplicateBudget = await BudgetModel.findOne({
    _id: { $ne: budgetId },
    userId,
    category: normalizedCategory,
    period: nextPeriod,
    month: nextMonth,
    year: nextYear,
  });

  if (duplicateBudget)
    throw new BadRequestException(
      "A budget already exists for this category and period",
    );

  budget.set({
    ...(body.category && { category: normalizedCategory }),
    ...(body.period && { period: body.period }),
    ...(body.month && { month: body.month }),
    ...(body.year && { year: body.year }),
    ...(body.limitAmount !== undefined && { limitAmount: body.limitAmount }),
  });

  await budget.save();

  return budget;
};

export const deleteBudgetService = async (userId: string, budgetId: string) => {
  const deletedBudget = await BudgetModel.findOneAndDelete({
    _id: budgetId,
    userId,
  });

  if (!deletedBudget) throw new NotFoundException("Budget not found");
};

export const getBudgetProgressService = async (
  userId: string,
  filter?: BudgetFilterType,
) => {
  const { month, year } = getEffectiveMonthYear(filter);
  const alertThreshold = filter?.alertThreshold ?? 80;

  const budgets = await BudgetModel.find({
    userId,
    month,
    year,
    period: BudgetPeriodEnum.MONTHLY,
  }).sort({ category: 1 });

  const { from, to } = getMonthDateRange(month, year);

  const groupedExpenses = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: TransactionTypeEnum.EXPENSE,
        date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        spentAmount: { $sum: { $abs: "$amount" } },
      },
    },
  ]);

  const expenseMap = new Map<string, number>();

  groupedExpenses.forEach((item) => {
    expenseMap.set(normalizeCategory(item._id), item.spentAmount / 100);
  });

  const progressItems = budgets.map((budget) => {
    const spentAmount = expenseMap.get(normalizeCategory(budget.category)) ?? 0;
    const limitAmount = budget.limitAmount;
    const remainingAmount = limitAmount - spentAmount;
    const usedPercentage =
      limitAmount > 0
        ? Number(((spentAmount / limitAmount) * 100).toFixed(2))
        : 0;
    const isOverBudget = remainingAmount < 0;
    const isNearLimit = !isOverBudget && usedPercentage >= alertThreshold;

    let alertStatus: "ON_TRACK" | "NEAR_LIMIT" | "OVER_LIMIT" = "ON_TRACK";
    let alertMessage: string | null = null;

    if (isOverBudget) {
      alertStatus = "OVER_LIMIT";
      alertMessage = `${budget.category} is over budget by ${Number(Math.abs(remainingAmount).toFixed(2))}`;
    } else if (isNearLimit) {
      alertStatus = "NEAR_LIMIT";
      alertMessage = `${budget.category} is nearing its limit at ${usedPercentage.toFixed(1)}% usage`;
    }

    return {
      id: budget.id,
      category: budget.category,
      month: budget.month,
      year: budget.year,
      period: budget.period,
      limitAmount,
      spentAmount: Number(spentAmount.toFixed(2)),
      remainingAmount: Number(remainingAmount.toFixed(2)),
      usedPercentage,
      isOverBudget,
      isNearLimit,
      alertStatus,
      alertMessage,
    };
  });

  const alerts = progressItems
    .filter((budget) => budget.alertStatus !== "ON_TRACK")
    .map((budget) => ({
      id: budget.id,
      category: budget.category,
      status: budget.alertStatus,
      remainingAmount: budget.remainingAmount,
      usedPercentage: budget.usedPercentage,
      message: budget.alertMessage,
    }));

  const totals = progressItems.reduce(
    (acc, budget) => {
      acc.totalLimit += budget.limitAmount;
      acc.totalSpent += budget.spentAmount;
      return acc;
    },
    {
      totalLimit: 0,
      totalSpent: 0,
    },
  );

  return {
    budgets: progressItems,
    alerts,
    summary: {
      totalLimit: Number(totals.totalLimit.toFixed(2)),
      totalSpent: Number(totals.totalSpent.toFixed(2)),
      totalRemaining: Number(
        (totals.totalLimit - totals.totalSpent).toFixed(2),
      ),
      usagePercentage:
        totals.totalLimit > 0
          ? Number(((totals.totalSpent / totals.totalLimit) * 100).toFixed(2))
          : 0,
      alertThreshold,
      overLimitCount: alerts.filter((alert) => alert.status === "OVER_LIMIT")
        .length,
      nearLimitCount: alerts.filter((alert) => alert.status === "NEAR_LIMIT")
        .length,
      hasAlerts: alerts.length > 0,
    },
    period: {
      month,
      year,
      period: BudgetPeriodEnum.MONTHLY,
      from,
      to,
    },
  };
};
