import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  signUp,
  login,
  me,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  deleteAccount,
} from "../controllers/auth.cont";
import authMiddleware from "../middlewares/auth";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signUp));
authRoutes.post("/login", errorHandler(login));
authRoutes.get("/me", [authMiddleware], errorHandler(me));
authRoutes.post("/forgot-password", errorHandler(forgotPassword));
authRoutes.post("/verify-reset-code", errorHandler(verifyResetCode));
authRoutes.post("/reset-password", errorHandler(resetPassword));
authRoutes.delete(
  "/delete-account",
  [authMiddleware],
  errorHandler(deleteAccount),
);

export default authRoutes;
