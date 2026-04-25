import mongoose, { Schema } from "mongoose";
import { convertCentsToKes, convertToCents } from "../utils/format-currency";

export enum BudgetPeriodEnum {
  MONTHLY = "MONTHLY",
}

export interface BudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  period: keyof typeof BudgetPeriodEnum;
  month: number;
  year: number;
  limitAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<BudgetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    period: {
      type: String,
      enum: Object.values(BudgetPeriodEnum),
      default: BudgetPeriodEnum.MONTHLY,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 1,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertCentsToKes(value),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

budgetSchema.index(
  { userId: 1, category: 1, period: 1, month: 1, year: 1 },
  { unique: true },
);

const BudgetModel = mongoose.model<BudgetDocument>("Budget", budgetSchema);

export default BudgetModel;
