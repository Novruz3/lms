import { Router } from "express";
import authMiddleware from "../../middlewares/auth";
import { studentMiddleware } from "../../middlewares/student";
import paymentRoutes from "./payment";
import enrollmentRoutes from "./enrollment";
import lectureRoutes from "./lecture";

const studentRouter = Router();

studentRouter.use(authMiddleware, studentMiddleware);

studentRouter.use("/payments", paymentRoutes);
studentRouter.use("/my-courses", enrollmentRoutes);
studentRouter.use("/lectures", lectureRoutes);

export default studentRouter;
