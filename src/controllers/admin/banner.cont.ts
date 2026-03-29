import { NextFunction, Request, Response } from "express";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";
import {
  CreateBannerInput,
  createBannerSchema,
  UpdateBannerInput,
  updateBannerSchema,
} from "../../schema/banner";
import prisma from "../../lib/prisma";
import { BadRequestException } from "../../exceptions/bad-requests";
import fs from "fs";
import path from "path";

export const addBanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: CreateBannerInput = createBannerSchema.parse(req.body);
  const image = await prisma.media.findUnique({
    where: { id: data.imageId },
  });
  if (!image) {
    throw new NotFoundException("Image not found", ErrorCode.MEDIA_NOT_FOUND);
  }
  if (image.type !== "IMAGE") {
    throw new NotFoundException(
      "Course image must be of type IMAGE",
      ErrorCode.INVALID_FILE_TYPE,
    );
  }
  if (image.courseId || image.userId || image.bannerId) {
    throw new BadRequestException(
      "This image is already attached to another course",
      ErrorCode.MEDIA_ALREADY_USED,
    );
  }
  const imageId = data.imageId;
  const { imageId: _, ...bannerData } = data;
  const banner = await prisma.$transaction(async (tx) => {
    const banner = await tx.banner.create({
      data: {
        ...bannerData,
      },
    });
    await tx.media.update({
      where: { id: imageId },
      data: { bannerId: banner.id },
    });
    return banner;
  });
  res.status(201).json({ message: "Banner created successfully", banner });
};

export const updateBanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: UpdateBannerInput = updateBannerSchema.parse(req.body);
  const { id } = req.params;
  const banner = await prisma.banner.findUnique({
    where: { id: Number(id) },
  });
  if (!banner) {
    throw new NotFoundException(
      "Banner not found with this id",
      ErrorCode.BANNER_NOT_FOUND,
    );
  }
  if (data.imageId) {
    const image = await prisma.media.findUnique({
      where: { id: data.imageId },
    });
    if (!image) {
      throw new NotFoundException("Image not found", ErrorCode.MEDIA_NOT_FOUND);
    }
    if (image.type !== "IMAGE") {
      throw new NotFoundException(
        "Course image must be of type IMAGE",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
    if (image.courseId || image.userId || image.bannerId) {
      throw new BadRequestException(
        "This image is already attached to another course",
        ErrorCode.MEDIA_ALREADY_USED,
      );
    }
    const oldImage = await prisma.media.findFirst({
      where: { bannerId: Number(id) },
    });
    if (oldImage) {
      const filePath = path.join(process.cwd(), oldImage.path);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      await prisma.media.delete({
        where: { id: oldImage.id },
      });
    }
    const imageId = data.imageId;
    delete data.imageId;
    await prisma.media.update({
      where: { id: imageId },
      data: {
        bannerId: Number(id),
      },
    });
  }
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  const updatedBanner = await prisma.banner.update({
    where: { id: Number(id) },
    data: updateData,
  });
  res
    .status(200)
    .json({ message: "Banner updated successfully", banner: updatedBanner });
};

export const deleteBanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const banner = await prisma.banner.findUnique({
    where: { id: Number(id) },
    include: {
      image: true,
    },
  });
  if (!banner) {
    throw new NotFoundException(
      "Banner not found with this id",
      ErrorCode.BANNER_NOT_FOUND,
    );
  }
  if (banner.image) {
    const filePath = path.join(process.cwd(), banner.image.path);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
  await prisma.banner.delete({
    where: { id: Number(id) },
  });
  res.status(200).json({ message: "Banner deleted successfully" });
};

export const getAllBanners = async (
  req : Request,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const [banners, total] = await prisma.$transaction([
    prisma.banner.findMany({
      skip,
      take: limit,
      include: {
        image: true,
      },
    }),
    prisma.banner.count({}),
  ]);
  res.status(200).json({ banners, total });
};
