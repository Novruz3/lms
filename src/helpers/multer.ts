import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { Request } from "express";
import { InternalException } from "../exceptions/internal-exception";

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const type = req.query.type;
  if (type === "avatar" || type === "course") {
    if (!file.mimetype.startsWith("image/")) {
      throw new InternalException(
        "Only image files allowed",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
  }
  if (type === "lecture") {
    const allowedTypes = [
      "video/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const isAllowed = allowedTypes.some((t) => file.mimetype.startsWith(t));
    if (!isAllowed) {
      throw new InternalException(
        "Invalid file type for lecture",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";
    const type = req.query.type;
    if (type === "avatar") {
      uploadPath += "avatars";
    } else if (type === "course") {
      uploadPath += "courses";
    } else if (type === "lecture") {
      if (file.mimetype.startsWith("video/")) {
        uploadPath += "lectures/videos";
      } else {
        uploadPath += "lectures/documents";
      }
    } else {
      throw new BadRequestException(
        "Invalid upload type",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});
