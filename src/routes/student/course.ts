import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getLikedCourses,
  toggleLikeCourse,
} from "../../controllers/student/course.cont";

const courseRoutes: Router = Router();

courseRoutes.post("/:courseId/like", errorHandler(toggleLikeCourse));
courseRoutes.get("/liked-courses", errorHandler(getLikedCourses));

export default courseRoutes;
