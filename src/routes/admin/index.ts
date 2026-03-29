import { Router } from "express";
import categoryRoutes from "./category";
import userRoutes from "./user";
import authMiddleware from "../../middlewares/auth";
import { adminMiddleware } from "../../middlewares/admin";
import courseRoutes from "./course";
import announcementRoutes from "./announcement";
import bannerRoutes from "./banner";

const adminRouter = Router();

userRoutes.use(authMiddleware, adminMiddleware);

adminRouter.use("/categories", categoryRoutes);
adminRouter.use("/users", userRoutes);
adminRouter.use("/courses", courseRoutes);
adminRouter.use("/announcements", announcementRoutes);
adminRouter.use("/banners", bannerRoutes);

export default adminRouter;
