import mongoose from "mongoose";
import { randomBytes } from "crypto";
import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";
import { calulateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";

interface AuthReportSetting {
  _id: mongoose.Types.ObjectId;
  frequency: keyof typeof ReportFrequencyEnum;
  isEnabled: boolean;
}

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) throw new UnauthorizedException("User already exists");

      const newUser = new UserModel({
        ...body,
      });

      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calulateNextReportDate(),
        lastSentDate: null,
      });
      await reportSetting.save({ session });

      return { user: newUser.omitPassword() };
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("Email/password not found");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid)
    throw new UnauthorizedException("Invalid email/password");

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 },
  ).lean<AuthReportSetting | null>();

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};

interface GoogleUserPayload {
  email: string;
  name: string;
  profilePicture?: string | null;
}

export const googleLoginService = async (payload: GoogleUserPayload) => {
  const normalizedEmail = payload.email.trim().toLowerCase();

  let user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    user = await UserModel.create({
      name: payload.name,
      email: normalizedEmail,
      profilePicture: payload.profilePicture ?? null,
      // Local password login is optional for OAuth users, but schema requires one.
      password: randomBytes(32).toString("hex"),
    });
  } else if (!user.profilePicture && payload.profilePicture) {
    user.profilePicture = payload.profilePicture;
    await user.save();
  }

  let reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 },
  ).lean<AuthReportSetting | null>();

  if (!reportSetting) {
    const newReportSetting = await ReportSettingModel.create({
      userId: user.id,
      frequency: ReportFrequencyEnum.MONTHLY,
      isEnabled: true,
      nextReportDate: calulateNextReportDate(),
      lastSentDate: null,
    });

    reportSetting = {
      _id: newReportSetting._id,
      frequency: newReportSetting.frequency,
      isEnabled: newReportSetting.isEnabled,
    };
  }

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};
