import { Router } from "express";
import {
  addContributionController,
  createGoalController,
  deleteGoalController,
  getAllGoalsController,
  getGoalByIdController,
  updateGoalController,
} from "../controllers/goal.controller";

const goalRoutes = Router();

goalRoutes.post("/create", createGoalController);
goalRoutes.get("/all", getAllGoalsController);
goalRoutes.get("/:id", getGoalByIdController);
goalRoutes.put("/update/:id", updateGoalController);
goalRoutes.delete("/delete/:id", deleteGoalController);
goalRoutes.post("/:id/contribute", addContributionController);

export default goalRoutes;
