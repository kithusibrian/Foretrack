import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  changePasswordService,
  deleteUserAccountService,
  findByIdUserService,
  updateUserService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { updateUserSchema } from "../validators/user.validator";
import {
  changePasswordSchema,
  deleteAccountSchema,
} from "../validators/auth.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  },
);
//Updating user details and profile picture
export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateUserSchema.parse(req.body);
    const userId = req.user?._id;
    const profilePic = req.file;

    const user = await updateUserService(userId, body, profilePic);

    return res.status(HTTPSTATUS.OK).json({
      message: "User profile updated successfully",
      data: user,
    });
  },
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = changePasswordSchema.parse(req.body);
    const userId = req.user?._id;

    await changePasswordService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password updated successfully",
    });
  },
);

export const deleteUserAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = deleteAccountSchema.parse(req.body);

    await deleteUserAccountService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Account and associated data deleted permanently",
    });
  },
);
