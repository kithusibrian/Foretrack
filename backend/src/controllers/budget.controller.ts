import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import {
  budgetFilterSchema,
  budgetIdSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "../validators/budget.validator";
import {
  createBudgetService,
  deleteBudgetService,
  getAllBudgetsService,
  getBudgetProgressService,
  updateBudgetService,
} from "../services/budget.service";

export const createBudgetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createBudgetSchema.parse(req.body);

    const budget = await createBudgetService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Budget created successfully",
      data: budget,
    });
  },
);

export const getAllBudgetsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const filter = budgetFilterSchema.parse(req.query);

    const budgets = await getAllBudgetsService(userId, filter);

    return res.status(HTTPSTATUS.OK).json({
      message: "Budgets fetched successfully",
      data: budgets,
    });
  },
);

export const updateBudgetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const budgetId = budgetIdSchema.parse(req.params.id);
    const body = updateBudgetSchema.parse(req.body);

    const budget = await updateBudgetService(userId, budgetId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Budget updated successfully",
      data: budget,
    });
  },
);

export const deleteBudgetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const budgetId = budgetIdSchema.parse(req.params.id);

    await deleteBudgetService(userId, budgetId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Budget deleted successfully",
    });
  },
);

export const getBudgetProgressController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const filter = budgetFilterSchema.parse(req.query);

    const budgetProgress = await getBudgetProgressService(userId, filter);

    return res.status(HTTPSTATUS.OK).json({
      message: "Budget progress fetched successfully",
      data: budgetProgress,
    });
  },
);
