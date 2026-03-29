import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../../controllers/student/comment.cont";

const commentRoutes: Router = Router();

commentRoutes.post("/courses/:courseId", errorHandler(addComment));
commentRoutes.put("/:id", errorHandler(updateComment));
commentRoutes.delete("/:id", errorHandler(deleteComment));

export default commentRoutes;
