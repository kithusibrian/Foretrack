import { Router } from "express";
import {
  createBudgetController,
  deleteBudgetController,
  getAllBudgetsController,
  getBudgetProgressController,
  updateBudgetController,
} from "../controllers/budget.controller";

const budgetRoutes = Router();

budgetRoutes.post("/create", createBudgetController);
budgetRoutes.get("/all", getAllBudgetsController);
budgetRoutes.get("/progress", getBudgetProgressController);
budgetRoutes.put("/update/:id", updateBudgetController);
budgetRoutes.delete("/delete/:id", deleteBudgetController);

export default budgetRoutes;
