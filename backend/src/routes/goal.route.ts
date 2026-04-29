import { Router } from "express";
import {
  addContributionController,
  createGoalController,
  deleteGoalController,
  getAllGoalsController,
  getGoalByIdController,
  removeContributionController,
  updateGoalController,
} from "../controllers/goal.controller";

const goalRoutes = Router();

goalRoutes.post("/create", createGoalController);
goalRoutes.get("/all", getAllGoalsController);
goalRoutes.get("/:id", getGoalByIdController);
goalRoutes.put("/update/:id", updateGoalController);
goalRoutes.delete("/delete/:id", deleteGoalController);
goalRoutes.post("/:id/contribute", addContributionController);
goalRoutes.post("/:id/remove-contribution", removeContributionController);

export default goalRoutes;
