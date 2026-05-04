import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/services/report.service", () => ({
  generateReportService: vi.fn(),
  getAllReportsService: vi.fn(),
  updateReportSettingService: vi.fn(),
}));

vi.mock("../src/models/user.model", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/report-setting.model", () => ({
  default: {
    findOne: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock("../src/models/report.model", () => ({
  ReportStatusEnum: {
    SENT: "SENT",
    FAILED: "FAILED",
    NO_ACTIVITY: "NO_ACTIVITY",
  },
  default: {
    bulkWrite: vi.fn(),
  },
}));

vi.mock("../src/mailers/report.mailer", () => ({
  sendReportEmail: vi.fn(),
}));

vi.mock("mongoose", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: vi.fn(),
    },
  };
});

import mongoose from "mongoose";
import UserModel from "../src/models/user.model";
import ReportSettingModel from "../src/models/report-setting.model";
import ReportModel from "../src/models/report.model";
import { sendReportEmail } from "../src/mailers/report.mailer";
import { generateReportService } from "../src/services/report.service";
import { generateReportForUserController } from "../src/controllers/report.controller";

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
}

describe("generateReportForUserController", () => {
  const mockSession = {
    withTransaction: vi.fn(async (fn: () => Promise<void>) => fn()),
    endSession: vi.fn(async () => undefined),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (mongoose.startSession as any).mockResolvedValue(mockSession);
    (ReportSettingModel.findOne as any).mockResolvedValue({ _id: "setting-1" });
    (ReportModel.bulkWrite as any).mockResolvedValue({});
    (ReportSettingModel.bulkWrite as any).mockResolvedValue({});
  });

  it("allows briaokm@gmail.com to trigger report for another user", async () => {
    (UserModel.findOne as any).mockResolvedValue({
      id: "target-user-1",
      email: "target@example.com",
      name: "Target User",
    });

    (generateReportService as any).mockResolvedValue({
      period: "April 1 - 30, 2026",
      summary: {
        income: 1000,
        expenses: 500,
        balance: 500,
        savingsRate: 50,
        topCategories: [],
      },
      insights: [],
    });

    const req = {
      user: {
        _id: "admin-1",
        email: "briaokm@gmail.com",
      },
      body: {
        email: "target@example.com",
      },
    } as any;
    const res = createRes();
    const next = vi.fn();

    await generateReportForUserController(req, res, next);

    expect(sendReportEmail).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects user trying to generate another user's report", async () => {
    (UserModel.findOne as any).mockResolvedValue({
      id: "target-user-1",
      email: "target@example.com",
      name: "Target User",
    });

    const req = {
      user: {
        _id: "user-2",
        email: "not-allowed@example.com",
      },
      body: {
        email: "target@example.com",
      },
    } as any;
    const res = createRes();
    const next = vi.fn();

    await generateReportForUserController(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toContain("Not authorized");
    expect(sendReportEmail).not.toHaveBeenCalled();
  });

  it("allows a user to trigger report for self", async () => {
    (UserModel.findById as any).mockResolvedValue({
      id: "self-user-1",
      email: "self@example.com",
      name: "Self User",
    });

    (generateReportService as any).mockResolvedValue({
      period: "April 1 - 30, 2026",
      summary: {
        income: 1000,
        expenses: 500,
        balance: 500,
        savingsRate: 50,
        topCategories: [],
      },
      insights: [],
    });

    const req = {
      user: {
        _id: "self-user-1",
        email: "self@example.com",
      },
      body: {},
    } as any;
    const res = createRes();
    const next = vi.fn();

    await generateReportForUserController(req, res, next);

    expect(sendReportEmail).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
