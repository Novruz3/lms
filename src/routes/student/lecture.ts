import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { getLectureById } from "../../controllers/student/lecture.cont";
import { checkCourseAccess } from "../../middlewares/course";

const lectureRoutes: Router = Router();

lectureRoutes.get(
  "/:lectureId",
  checkCourseAccess,
  errorHandler(getLectureById),
);

export default lectureRoutes;
