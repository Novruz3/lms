import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addCourse,
  deleteCourse,
  getCourseById,
  getInstructorCourses,
  updateCourse,
} from "../../controllers/instructor/course.cont";

const courseRoutes: Router = Router();

courseRoutes.post("/", errorHandler(addCourse));
courseRoutes.get("/", errorHandler(getInstructorCourses));
courseRoutes.put("/:id", errorHandler(updateCourse));
courseRoutes.delete("/:id", errorHandler(deleteCourse));
courseRoutes.get("/:id", errorHandler(getCourseById));

export default courseRoutes;
