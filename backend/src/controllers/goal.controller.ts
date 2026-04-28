import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import {
  contributeSchema,
  createGoalSchema,
  goalIdSchema,
  updateGoalSchema,
} from "../validators/goal.validator";
import {
  addContributionService,
  createGoalService,
  deleteGoalService,
  getAllGoalsService,
  getGoalByIdService,
  updateGoalService,
} from "../services/goal.service";

export const createGoalController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const body = createGoalSchema.parse(req.body);

  const goal = await createGoalService(userId, body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Goal created successfully",
    data: goal,
  });
});

export const getAllGoalsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const goals = await getAllGoalsService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goals fetched successfully",
    data: goals,
  });
});

export const getGoalByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const goalId = goalIdSchema.parse(req.params.id);

  const goal = await getGoalByIdService(userId, goalId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal fetched successfully",
    data: goal,
  });
});

export const updateGoalController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const goalId = goalIdSchema.parse(req.params.id);
  const body = updateGoalSchema.parse(req.body);

  const goal = await updateGoalService(userId, goalId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal updated successfully",
    data: goal,
  });
});

export const deleteGoalController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const goalId = goalIdSchema.parse(req.params.id);

  await deleteGoalService(userId, goalId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal deleted successfully",
  });
});

export const addContributionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const goalId = goalIdSchema.parse(req.params.id);
  const body = contributeSchema.parse(req.body);

  const goal = await addContributionService(userId, goalId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Contribution added successfully",
    data: goal,
  });
});
