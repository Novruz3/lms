import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "../../controllers/admin/banner.cont";

const bannerRoutes: Router = Router();

bannerRoutes.post("/", errorHandler(addBanner));
bannerRoutes.put("/:id", errorHandler(updateBanner));
bannerRoutes.delete("/:id", errorHandler(deleteBanner));
bannerRoutes.get("/", errorHandler(getAllBanners));

export default bannerRoutes;
