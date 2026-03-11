import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../../controllers/admin/category.cont";

const categoryRoutes: Router = Router();

categoryRoutes.post("/", errorHandler(addCategory));
categoryRoutes.get("/", errorHandler(getAllCategories));
categoryRoutes.put("/:id", errorHandler(updateCategory));
categoryRoutes.delete("/:id", errorHandler(deleteCategory));
categoryRoutes.get("/:id", errorHandler(getCategoryById));

export default categoryRoutes;
