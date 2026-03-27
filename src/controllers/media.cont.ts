import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";
import sharp from "sharp";
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
  const { mimetype, filename, path: filePath, size } = req.file;
  let type: "IMAGE" | "VIDEO" | "DOCUMENT";
  let finalPath = filePath;
  let finalFilename = filename;
  if (mimetype.startsWith("image")) {
    type = "IMAGE";
    const newFilename = `resized-${Date.now()}.jpeg`;
    const newPath = path.join(path.dirname(filePath), newFilename);
    await sharp(filePath)
      .resize(800)
      .jpeg({ quality: 80 })
      .toFile(newPath);
    fs.unlinkSync(filePath);
    finalPath = newPath;
    finalFilename = newFilename;
  }
  else if (mimetype.startsWith("video")) {
    type = "VIDEO";
  }
  else {
    type = "DOCUMENT";
  }
  const media = await prisma.media.create({
    data: {
      filename: finalFilename,
      path: finalPath,
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
  const { id } = req.params;
  const media = await prisma.media.findUnique({
    where: { id: Number(id) },
  });
  if (!media) {
    throw new NotFoundException(
      "Media not found with this id",
      ErrorCode.MEDIA_NOT_FOUND,
    );
  }
  if (fs.existsSync(media.path)) {
    fs.unlinkSync(media.path);
  }
  await prisma.media.delete({
    where: { id: media.id },
  });
  res.status(200).json({ message: "Media deleted successfully" });
};

export const streamVideo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const media = await prisma.media.findUnique({
    where: { id: Number(id) },
  });
  if (!media) {
    throw new NotFoundException(
      "Media not found",
      ErrorCode.MEDIA_NOT_FOUND,
    );
  }
  if (media.type !== "VIDEO") {
    throw new NotFoundException(
      "This media is not a video",
      ErrorCode.INVALID_FILE_TYPE,
    );
  }
  const videoPath = path.join(process.cwd(), media.path);
  if (!fs.existsSync(videoPath)) {
    throw new NotFoundException(
      "Video file not found",
      ErrorCode.MEDIA_NOT_FOUND,
    );
  }
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (!range) {
    return res.status(400).json({ message: "Range header is required" });
  }
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0]?.toString() || "0", 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;
  const file = fs.createReadStream(videoPath, { start, end });
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
  });
  file.pipe(res);
};
