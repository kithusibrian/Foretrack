import { genAI, genAIModel } from "../config/google-ai.config";
import { createUserContent } from "@google/genai";
import {
  summaryAnalyticsService,
  expensePieChartBreakdownService,
} from "./analytics.service";
import { getBudgetProgressService } from "./budget.service";
import { coachPrompt } from "../utils/prompt";
import TransactionModel from "../models/transaction.model";

export const generateCoachResponse = async (
  userId: string,
  question: string,
  dateRangePreset?: any,
  customFrom?: Date,
  customTo?: Date,
) => {
  // gather analytics context
  const summary = await summaryAnalyticsService(
    userId,
    dateRangePreset,
    customFrom,
    customTo,
  );

  const breakdown = await expensePieChartBreakdownService(
    userId,
    dateRangePreset,
    customFrom,
    customTo,
  );

  const budgetDate = customTo || customFrom || new Date();
  const budgetProgress = await getBudgetProgressService(userId, {
    month: budgetDate.getMonth() + 1,
    year: budgetDate.getFullYear(),
  });

  const transactionFilter: any = {
    userId,
    ...(customFrom && customTo
      ? {
          date: {
            $gte: customFrom,
            $lte: customTo,
          },
        }
      : {}),
  };

  // Fetch ALL transactions in date range (no limit) for comprehensive analysis
  const allTransactions = await TransactionModel.find(transactionFilter)
    .sort({ date: -1, createdAt: -1 })
    .select("title amount category type date description paymentMethod")
    .exec();

  // Group transactions by week and day for time-series analysis
  const transactionsByWeek: Record<string, any[]> = {};
  const transactionsByDay: Record<string, any[]> = {};
  const expensesByCategory: Record<string, number> = {};

  allTransactions.forEach((item) => {
    const txDate = new Date(item.date);
    const dayKey = txDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const weekStart = new Date(txDate);
    weekStart.setDate(txDate.getDate() - txDate.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split("T")[0];

    const txObj = {
      title: item.title,
      amount: Number(item.amount || 0),
      category: item.category,
      type: item.type,
      date: item.date,
      description: item.description,
      paymentMethod: item.paymentMethod,
    };

    if (!transactionsByDay[dayKey]) transactionsByDay[dayKey] = [];
    transactionsByDay[dayKey].push(txObj);

    if (!transactionsByWeek[weekKey]) transactionsByWeek[weekKey] = [];
    transactionsByWeek[weekKey].push(txObj);

    // Accumulate expense categories for easy lookup
    if (item.type === "EXPENSE") {
      const cat = item.category || "other";
      expensesByCategory[cat] =
        (expensesByCategory[cat] || 0) + Number(item.amount || 0);
    }
  });

  // build categories object from breakdown
  const categories: Record<string, { amount: number; percentage: number }> = {};
  (breakdown.breakdown || []).forEach((item: any) => {
    categories[item.name] = { amount: item.value, percentage: item.percentage };
  });

  const stats = {
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    availableBalance: summary.availableBalance,
    savingsRate: summary.savingRate.percentage,
    categories,
    budgetSummary: budgetProgress.summary,
    budgetPeriod: budgetProgress.period,
    budgets: budgetProgress.budgets,
    recentTransactions: allTransactions.slice(0, 20).map((item) => ({
      title: item.title,
      amount: Number(item.amount || 0),
      category: item.category,
      type: item.type,
      date: item.date,
      description: item.description,
      paymentMethod: item.paymentMethod,
    })),
    // New: All transactions for deeper analysis
    allTransactions: allTransactions.map((item) => ({
      title: item.title,
      amount: Number(item.amount || 0),
      category: item.category,
      type: item.type,
      date: item.date,
      description: item.description,
      paymentMethod: item.paymentMethod,
    })),
    transactionsByWeek,
    transactionsByDay,
    expensesByCategory,
    transactionCount: allTransactions.length,
  };

  const prompt = coachPrompt({ question, stats });

  try {
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [createUserContent([prompt])],
      config: {
        temperature: 0.2,
        topP: 1,
        responseMimeType: "text/plain",
      },
    });

    const response = result.text || "";
    const cleaned = response.replace(/```(?:json)?\n?/g, "").trim();
    return { answer: cleaned };
  } catch (error: any) {
    console.error(
      "COACH ERROR:",
      error?.response?.data || error?.message || error,
    );
    throw new Error("Coach service unavailable");
  }
};
