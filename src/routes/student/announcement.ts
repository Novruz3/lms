import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { getAllAnnouncements } from "../../controllers/admin/announcement.cont";

const announcementRoutes: Router = Router();

announcementRoutes.get("/", errorHandler(getAllAnnouncements));

export default announcementRoutes;
