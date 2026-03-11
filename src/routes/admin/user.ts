import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getAllUsersWithRole,
  getUserDetails,
} from "../../controllers/admin/user.cont";

const userRoutes: Router = Router();

userRoutes.get("/", errorHandler(getAllUsersWithRole));
userRoutes.get("/:id", errorHandler(getUserDetails));

export default userRoutes;
