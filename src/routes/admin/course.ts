import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getAllCourses,
  getCourseById,
} from "../../controllers/admin/course.cont";

const courseRoutes: Router = Router();

courseRoutes.get("/", errorHandler(getAllCourses));
courseRoutes.get("/:id", errorHandler(getCourseById));

export default courseRoutes;
