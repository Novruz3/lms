import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import fs from "fs";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const uploadMedia = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    throw new NotFoundException("File is required", ErrorCode.FILE_REQUIRED);
  }
  const { mimetype, filename, path, size } = req.file;
  let type: "IMAGE" | "VIDEO" | "DOCUMENT";
  if (mimetype.startsWith("image")) {
    type = "IMAGE";
  } else if (mimetype.startsWith("video")) {
    type = "VIDEO";
  } else {
    type = "DOCUMENT";
  }
  const media = await prisma.media.create({
    data: {
      filename,
      path,
      mimeType: mimetype,
      type,
      size,
    },
  });
  res.status(201).json({
    message: "Media uploaded successfully",
    media,
  });
};

export const deleteMedia = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {id} = req.params;
  const media = await prisma.media.findUnique({
    where : {
      id : Number(id)
    }
  })
  if (!media) {
    throw new NotFoundException(
      "Media not found with this id",
      ErrorCode.MEDIA_NOT_FOUND
    )
  }
  if (fs.existsSync(media.path)) {
    fs.unlinkSync(media.path);
  }
  await prisma.media.delete({
    where: { id: media.id },
  });
  res.status(200).json({message : "Media deleted successfully"})
}