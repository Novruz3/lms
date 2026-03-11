import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { getMyCourses } from "../../controllers/student/course.cont";

const enrollmentRoutes: Router = Router();

enrollmentRoutes.get("/", errorHandler(getMyCourses))

export default enrollmentRoutes;
