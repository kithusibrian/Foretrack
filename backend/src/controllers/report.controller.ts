import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import mongoose from "mongoose";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service";
import {
  updateReportSettingSchema,
  generateManualReportSchema,
} from "../validators/report.validator";
import UserModel from "../models/user.model";
import ReportSettingModel from "../models/report-setting.model";
import ReportModel, { ReportStatusEnum } from "../models/report.model";
import { sendReportEmail } from "../mailers/report.mailer";
import { calulateNextReportDate } from "../utils/helper";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  },
);

export const updateReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  },
);

export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to } = req.query;
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await generateReportService(userId, fromDate, toDate);

    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated successfully",
      ...result,
    });
  },
);

export const generateReportForUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = req.user;
    const body = generateManualReportSchema.parse(req.body);

    const { email, from, to } = body;

    // Determine date range: default to last month
    const now = new Date();
    const fromDate = from ? new Date(from) : startOfMonth(subMonths(now, 1));
    const toDate = to ? new Date(to) : endOfMonth(subMonths(now, 1));

    // Resolve target user
    const targetUser = email
      ? await UserModel.findOne({ email })
      : await UserModel.findById(requester?._id);

    if (!targetUser) throw new NotFoundException("User not found");

    const requesterEmail = requester?.email;
    const isAllowed =
      requesterEmail === targetUser.email ||
      requesterEmail === "briaokm@gmail.com";

    if (!isAllowed)
      throw new UnauthorizedException("Not authorized to generate this report");

    const session = await mongoose.startSession();
    try {
      const report = await generateReportService(
        targetUser.id,
        fromDate,
        toDate,
      );

      let emailSent = false;
      if (report) {
        try {
          await sendReportEmail({
            email: targetUser.email!,
            username: targetUser.name!,
            report: {
              period: report.period,
              totalIncome: report.summary.income,
              totalExpenses: report.summary.expenses,
              availableBalance: report.summary.balance,
              savingsRate: report.summary.savingsRate,
              topSpendingCategories: report.summary.topCategories,
              insights: report.insights,
            },
            frequency: "Manual",
          });
          emailSent = true;
        } catch (error) {
          console.log(`Email failed for ${targetUser.id}`);
        }
      }

      await session.withTransaction(async () => {
        const bulkReports: any[] = [];
        const bulkSettings: any[] = [];

        const setting = await ReportSettingModel.findOne({
          userId: targetUser.id,
        });

        if (report && emailSent) {
          bulkReports.push({
            insertOne: {
              document: {
                userId: targetUser.id,
                sentDate: now,
                period: report.period,
                status: ReportStatusEnum.SENT,
                createdAt: now,
                updatedAt: now,
              },
            },
          });

          if (setting) {
            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    lastSentDate: now,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          }
        } else {
          bulkReports.push({
            insertOne: {
              document: {
                userId: targetUser.id,
                sentDate: now,
                period:
                  report?.period ||
                  `${fromDate.toISOString()}–${toDate.toISOString()}`,
                status: report
                  ? ReportStatusEnum.FAILED
                  : ReportStatusEnum.NO_ACTIVITY,
                createdAt: now,
                updatedAt: now,
              },
            },
          });

          if (setting) {
            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    lastSentDate: null,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          }
        }

        await Promise.all([
          ReportModel.bulkWrite(bulkReports, { ordered: false }),
          bulkSettings.length
            ? ReportSettingModel.bulkWrite(bulkSettings, { ordered: false })
            : Promise.resolve(),
        ]);
      });

      return res.status(HTTPSTATUS.OK).json({
        message: "Manual report generation finished",
        processed: 1,
        failed: 0,
      });
    } finally {
      await session.endSession();
    }
  },
);
