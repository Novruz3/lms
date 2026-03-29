import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { markAsRead } from "../../controllers/student/notification.cont";

const notificationRoutes: Router = Router();

notificationRoutes.put("/:id/read", errorHandler(markAsRead));

export default notificationRoutes;
