import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  updateReportSettingController,
  generateReportForUserController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.post("/generate-manual", generateReportForUserController);
reportRoutes.put("/update-setting", updateReportSettingController);

export default reportRoutes;
