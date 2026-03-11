import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getAllInstructors,
  getInstructorDetails,
} from "../../controllers/public/instructor";

const instructorRoutes: Router = Router();

instructorRoutes.get("/", errorHandler(getAllInstructors));
instructorRoutes.get("/:id", errorHandler(getInstructorDetails));

export default instructorRoutes;
