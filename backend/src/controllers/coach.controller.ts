import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { Request, Response } from "express";
import { generateCoachResponse } from "../services/coach.service";
import { DateRangePreset } from "../enums/date-range.enum";
import { HTTPSTATUS } from "../config/http.config";

export const coachController = {
  ask: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const { question, preset, from, to } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ message: "question is required" });
    }

    const filter = {
      dateRangePreset: preset as DateRangePreset,
      customFrom: from ? new Date(from) : undefined,
      customTo: to ? new Date(to) : undefined,
    };

    const answer = await generateCoachResponse(
      userId,
      question,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo,
    );

    return res.status(HTTPSTATUS.OK).json({ data: answer });
  }),
};
