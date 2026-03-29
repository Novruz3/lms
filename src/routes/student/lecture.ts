import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getLectureById,
  updateLectureProgress,
} from "../../controllers/student/lecture.cont";
import { checkCourseAccess } from "../../middlewares/course";

const lectureRoutes: Router = Router();

lectureRoutes.get(
  "/:lectureId",
  checkCourseAccess,
  errorHandler(getLectureById),
);
lectureRoutes.put(
  "/:lectureId/progress",
  checkCourseAccess,
  errorHandler(updateLectureProgress),
);

export default lectureRoutes;
