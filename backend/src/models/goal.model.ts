import mongoose, { Schema } from "mongoose";
import { convertToCents, convertCentsToKes } from "../utils/format-currency";

export enum GoalStatusEnum {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface GoalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  status: keyof typeof GoalStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<GoalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    targetAmount: {
      type: Number,
      required: true,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertCentsToKes(value),
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertCentsToKes(value),
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(GoalStatusEnum),
      default: GoalStatusEnum.ACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

goalSchema.index({ userId: 1, title: 1 }, { unique: false });

const GoalModel = mongoose.model<GoalDocument>("Goal", goalSchema);

export default GoalModel;
