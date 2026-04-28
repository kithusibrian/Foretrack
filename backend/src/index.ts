import dotenv from "dotenv";
dotenv.config({ override: true });
import passport from "passport";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Env } from "./config/env.config";
import { initializeCrons } from "./cron";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { BadRequestException } from "./utils/app-error";
import { asyncHandler } from "./middlewares/asyncHandler.middlerware";
import connctDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import reportRoutes from "./routes/report.route";
import { getDateRange } from "./utils/date";
import analyticsRoutes from "./routes/analytics.route";
import budgetRoutes from "./routes/budget.route";
import goalRoutes from "./routes/goal.route";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Welcome brother",
    });
  }),
);

app.use(`${BASE_PATH}/auth`, authRoutes);

app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);

app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);

app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);

app.use(`${BASE_PATH}/budget`, passportAuthenticateJwt, budgetRoutes);
app.use(`${BASE_PATH}/goal`, passportAuthenticateJwt, goalRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connctDatabase();
  if (Env.NODE_ENV === "development") {
    await initializeCrons();
  }
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
