import { Router } from "express";
import { errorHandler } from "../../error-handler";
import { getAllCategories } from "../../controllers/public/category.cont";

const categoryRoutes: Router = Router();

categoryRoutes.get("/", errorHandler(getAllCategories));

export default categoryRoutes;
