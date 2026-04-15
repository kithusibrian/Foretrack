import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import {
  googleLoginService,
  loginService,
  registerService,
} from "../services/auth.service";
import { BadRequestException } from "../utils/app-error";
import { Env } from "../config/env.config";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  },
);

export const googleCallbackController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = req.user as {
      emails?: Array<{ value: string }>;
      displayName?: string;
      photos?: Array<{ value: string }>;
    };

    const email = profile?.emails?.[0]?.value;

    if (!email) {
      throw new BadRequestException("Google account email is required");
    }

    const result = await googleLoginService({
      email,
      name: profile.displayName || email.split("@")[0],
      profilePicture: profile?.photos?.[0]?.value ?? null,
    });

    const params = new URLSearchParams({
      accessToken: result.accessToken,
      expiresAt: String(result.expiresAt),
      user: JSON.stringify(result.user),
      reportSetting: JSON.stringify(result.reportSetting ?? null),
    });

    return res.redirect(
      `${Env.FRONTEND_AUTH_CALLBACK_URL}?${params.toString()}`,
    );
  },
);
