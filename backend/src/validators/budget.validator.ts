import { z } from "zod";
import { BudgetPeriodEnum } from "../models/budget.model";

const currentDate = new Date();

export const budgetIdSchema = z.string().trim().min(1);

export const baseBudgetSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  limitAmount: z.number().positive("Budget amount must be positive").min(1),
  period: z.enum([BudgetPeriodEnum.MONTHLY]).default(BudgetPeriodEnum.MONTHLY),
  month: z
    .number()
    .int("Month must be a whole number")
    .min(1)
    .max(12)
    .default(currentDate.getMonth() + 1),
  year: z
    .number()
    .int("Year must be a whole number")
    .min(2000)
    .max(2100)
    .default(currentDate.getFullYear()),
});

export const createBudgetSchema = baseBudgetSchema;
export const updateBudgetSchema = baseBudgetSchema.partial();

export const budgetFilterSchema = z.object({
  month: z
    .preprocess(
      (val) => (typeof val === "string" && val ? Number(val) : undefined),
      z.number().int().min(1).max(12).optional(),
    )
    .optional(),
  year: z
    .preprocess(
      (val) => (typeof val === "string" && val ? Number(val) : undefined),
      z.number().int().min(2000).max(2100).optional(),
    )
    .optional(),
  alertThreshold: z
    .preprocess(
      (val) => (typeof val === "string" && val ? Number(val) : undefined),
      z.number().min(1).max(100).optional(),
    )
    .optional(),
});

export type CreateBudgetType = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetType = z.infer<typeof updateBudgetSchema>;
export type BudgetFilterType = z.infer<typeof budgetFilterSchema>;
