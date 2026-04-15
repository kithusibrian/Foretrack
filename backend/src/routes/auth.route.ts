import { Router } from "express";
import passport from "passport";
import { Env } from "../config/env.config";
import {
  googleCallbackController,
  loginController,
  registerController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get(
  "/google",
  (_req, res, next) => {
    if (!Env.GOOGLE_CLIENT_ID || !Env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: "Google OAuth is not configured on the server",
      });
    }

    return next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${Env.FRONTEND_AUTH_CALLBACK_URL}?error=google_auth_failed`,
  }),
  googleCallbackController,
);

export default authRoutes;
