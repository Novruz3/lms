import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  deleteMedia,
  streamVideo,
  uploadMedia,
} from "../controllers/media.cont";
import { upload } from "../helpers/multer";

const mediaRoutes: Router = Router();

mediaRoutes.post("/upload", upload.single("file"), errorHandler(uploadMedia));
mediaRoutes.delete("/:id", errorHandler(deleteMedia));
mediaRoutes.get("/stream/:id", errorHandler(streamVideo));

export default mediaRoutes;
