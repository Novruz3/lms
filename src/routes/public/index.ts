import { Router } from "express";
import categoryRoutes from "./category";
import courseRoutes from "./course";
import instructorRoutes from "./instructor";
import bannerRoutes from "./banner";

const publicRouter = Router();

publicRouter.use("/categories", categoryRoutes);
publicRouter.use("/courses", courseRoutes);
publicRouter.use("/instructors", instructorRoutes);
publicRouter.use("/banners", bannerRoutes);

export default publicRouter;
