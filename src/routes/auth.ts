import { Router } from "express";
import { errorHandler } from "../error-handler";
import { signUp, login, me } from "../controllers/auth.cont";
import authMiddleware from "../middlewares/auth";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signUp));
authRoutes.post("/login", errorHandler(login));
authRoutes.get("/me", [authMiddleware], errorHandler(me));

export default authRoutes;
