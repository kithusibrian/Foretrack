import mongoose from "mongoose";
import UserModel from "../models/user.model";
import ReportModel from "../models/report.model";
import ReportSettingModel from "../models/report-setting.model";
import TransactionModel from "../models/transaction.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";
import {
  ChangePasswordSchemaType,
  DeleteAccountSchemaType,
} from "../validators/auth.validator";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};
// function to update user details and profile picture
export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File,
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    name: body.name,
  });

  await user.save();

  return user.omitPassword(); //hide password in response
};

export const changePasswordService = async (
  userId: string,
  body: ChangePasswordSchemaType,
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  const isPasswordValid = await user.comparePassword(body.currentPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Current password is incorrect");
  }

  if (body.currentPassword === body.newPassword) {
    throw new BadRequestException(
      "New password must be different from the current password",
    );
  }

  user.password = body.newPassword;
  await user.save();

  return user.omitPassword();
};

export const deleteUserAccountService = async (
  userId: string,
  body: DeleteAccountSchemaType,
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await UserModel.findById(userId).session(session);
      if (!user) throw new NotFoundException("User not found");

      const isPasswordValid = await user.comparePassword(body.currentPassword);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Current password is incorrect");
      }

      if (body.confirmationText !== "DELETE") {
        throw new BadRequestException('Please type "DELETE" to confirm');
      }

      await Promise.all([
        TransactionModel.deleteMany({ userId }).session(session),
        ReportModel.deleteMany({ userId }).session(session),
        ReportSettingModel.deleteMany({ userId }).session(session),
        UserModel.deleteOne({ _id: userId }).session(session),
      ]);
    });
  } finally {
    await session.endSession();
  }
};
