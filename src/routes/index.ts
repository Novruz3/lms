import { Router } from "express";
import authRoutes from "./auth";
import mediaRoutes from "./media";
import instructorRouter from "./instructor";
import adminRouter from "./admin";
import studentRouter from "./student";
import publicRouter from "./public";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/media", mediaRoutes);
rootRouter.use("/admin", adminRouter);
rootRouter.use("/instructor", instructorRouter);
rootRouter.use("/student", studentRouter);
rootRouter.use("/", publicRouter);

export default rootRouter;
