import { z } from "zod";

const now = new Date();

export const goalIdSchema = z.string().trim().min(1);

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  targetDate: z
    .preprocess((val) => {
      if (typeof val === "string" && val) return new Date(val);
      return val;
    }, z.date().min(now, "Target date must be in the future").optional())
    .optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeSchema = z.object({
  amount: z.number().positive("Contribution must be positive"),
  transactionId: z.string().trim().optional(),
});

export type CreateGoalType = z.infer<typeof createGoalSchema>;
export type UpdateGoalType = z.infer<typeof updateGoalSchema>;
export type ContributeType = z.infer<typeof contributeSchema>;
