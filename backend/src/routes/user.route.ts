import { Router } from "express";
import {
  changePasswordController,
  deleteUserAccountController,
  getCurrentUserController,
  updateUserController,
} from "../controllers/user.controller";
import { upload } from "../config/cloudinary.config";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put("/change-password", changePasswordController);
userRoutes.delete("/delete-account", deleteUserAccountController);
userRoutes.put(
  "/update",
  upload.single("profilePicture"),
  updateUserController,
);

export default userRoutes;
