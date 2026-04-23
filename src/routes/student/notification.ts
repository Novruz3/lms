import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  getMyNotifications,
  markAsRead,
} from "../../controllers/student/notification.cont";

const notificationRoutes: Router = Router();

notificationRoutes.get("/", errorHandler(getMyNotifications));
notificationRoutes.put("/:id/read", errorHandler(markAsRead));

export default notificationRoutes;
