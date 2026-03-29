import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { getAllBanners } from "../../controllers/public/banner.cont";

const bannerRoutes: Router = Router();

bannerRoutes.get("/", errorHandler(getAllBanners));

export default bannerRoutes;
