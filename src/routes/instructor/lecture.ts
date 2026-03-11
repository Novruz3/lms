import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addLecture,
  deleteLecture,
  getAllLecturesWithCourseId,
  getLectureById,
  updateLecture,
} from "../../controllers/instructor/lecture.cont";

const lectureRoutes = Router();

lectureRoutes.post("/courses/:courseId", errorHandler(addLecture));
lectureRoutes.put("/:lectureId", errorHandler(updateLecture));
lectureRoutes.get(
  "/courses/:courseId",
  errorHandler(getAllLecturesWithCourseId),
);
lectureRoutes.get("/:lectureId", errorHandler(getLectureById));
lectureRoutes.delete("/:lectureId", errorHandler(deleteLecture));

export default lectureRoutes;
