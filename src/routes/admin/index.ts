import { Router } from "express";
import categoryRoutes from "./category";
import userRoutes from "./user";
import authMiddleware from "../../middlewares/auth";
import { adminMiddleware } from "../../middlewares/admin";
import courseRoutes from "./course";

const adminRouter = Router();

userRoutes.use(authMiddleware, adminMiddleware);

adminRouter.use("/categories", categoryRoutes);
adminRouter.use("/users", userRoutes);
adminRouter.use("/courses", courseRoutes);

export default adminRouter;
