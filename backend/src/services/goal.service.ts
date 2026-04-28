import mongoose from "mongoose";
import GoalModel, { GoalStatusEnum } from "../models/goal.model";
import TransactionModel from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  ContributeType,
  CreateGoalType,
  UpdateGoalType,
} from "../validators/goal.validator";

export const createGoalService = async (userId: string, body: CreateGoalType) => {
  const existing = await GoalModel.findOne({ userId, title: body.title });
  if (existing) throw new BadRequestException("A goal with this title already exists");

  const goal = await GoalModel.create({
    ...body,
    userId,
    currentAmount: 0,
    status: GoalStatusEnum.ACTIVE,
  });

  return goal;
};

export const getAllGoalsService = async (userId: string) => {
  const goals = await GoalModel.find({ userId }).sort({ createdAt: -1 });
  return goals;
};

export const getGoalByIdService = async (userId: string, goalId: string) => {
  const goal = await GoalModel.findOne({ _id: goalId, userId });
  if (!goal) throw new NotFoundException("Goal not found");
  return goal;
};

export const updateGoalService = async (
  userId: string,
  goalId: string,
  body: UpdateGoalType,
) => {
  const goal = await GoalModel.findOne({ _id: goalId, userId });
  if (!goal) throw new NotFoundException("Goal not found");

  goal.set({ ...body });

  // if targetAmount provided and currentAmount >= targetAmount, mark completed
  if (body.targetAmount !== undefined && goal.currentAmount >= body.targetAmount) {
    goal.status = GoalStatusEnum.COMPLETED;
  }

  await goal.save();
  return goal;
};

export const deleteGoalService = async (userId: string, goalId: string) => {
  const deleted = await GoalModel.findOneAndDelete({ _id: goalId, userId });
  if (!deleted) throw new NotFoundException("Goal not found");
};

export const addContributionService = async (
  userId: string,
  goalId: string,
  body: ContributeType,
) => {
  const goal = await GoalModel.findOne({ _id: goalId, userId });
  if (!goal) throw new NotFoundException("Goal not found");

  if (goal.status === GoalStatusEnum.COMPLETED)
    throw new BadRequestException("Goal already completed");

  // If transactionId provided, prevent re-linking and ensure ownership.
  if (body.transactionId) {
    const txn = await TransactionModel.findOne({ _id: body.transactionId, userId });
    if (!txn) throw new NotFoundException("Transaction not found");

    if (txn.isContribution && txn.goalId) {
      throw new BadRequestException("This transaction is already linked to a goal contribution");
    }

    // Link transaction to the goal and mark as contribution.
    txn.goalId = goal._id;
    txn.isContribution = true;
    await txn.save();
  }

  // amount is expected in decimal (KES). model setters convert to cents
  goal.currentAmount = (goal.currentAmount ?? 0) + (body.amount as unknown as number);

  if (goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount) {
    goal.status = GoalStatusEnum.COMPLETED;
  }

  await goal.save();

  return goal;
};
