import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
} from "../../controllers/admin/announcement.cont";

const announcementRoutes: Router = Router();

announcementRoutes.post("/", errorHandler(addAnnouncement));
announcementRoutes.get("/", errorHandler(getAllAnnouncements));
announcementRoutes.put("/:id", errorHandler(editAnnouncement));
announcementRoutes.delete("/:id", errorHandler(deleteAnnouncement));
announcementRoutes.get("/:id", errorHandler(getAnnouncementById));

export default announcementRoutes;
