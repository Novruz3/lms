import { Router } from "express";
import courseRoutes from "./course";
import lectureRoutes from "./lecture";
import authMiddleware from "../../middlewares/auth";
import { instructorMiddleware } from "../../middlewares/instructor";

const instructorRouter = Router();

instructorRouter.use(authMiddleware, instructorMiddleware);

instructorRouter.use("/courses", courseRoutes);
instructorRouter.use("/lectures", lectureRoutes);

export default instructorRouter;
