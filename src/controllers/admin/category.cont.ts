import { NextFunction, Request, Response } from "express";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../schema/category";
import prisma from "../../lib/prisma";
import slugify from "slugify";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = createCategorySchema.parse(req.body);
  const parentCategory = data.parentId
    ? await prisma.category.findUnique({
        where: { id: data.parentId },
      })
    : null;
  if (data.parentId && !parentCategory) {
    throw new NotFoundException(
      "Parent category not found with this id",
      ErrorCode.PARENT_CATEGORY_NOT_FOUND,
    );
  }
  const slug = slugify(data.name, { lower: true, strict: true });
  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      slug,
      parentId: data.parentId!,
    },
  });
  res.status(201).json({ message: "Category created successfully", category });
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: any = updateCategorySchema.parse(req.body);
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  if (!category) {
    throw new NotFoundException(
      "Category not found with this id",
      ErrorCode.CATEGORY_NOT_FOUND,
    );
  }
  const parentCategory = data.parentId
    ? await prisma.category.findUnique({
        where: { id: data.parentId },
      })
    : null;
  if (data.parentId && !parentCategory) {
    throw new NotFoundException(
      "Parent category not found with this id",
      ErrorCode.PARENT_CATEGORY_NOT_FOUND,
    );
  }
  if (data.parentId === Number(id)) {
    throw new NotFoundException(
      "Category cannot be its own parent",
      ErrorCode.PARENT_CATEGORY_NOT_FOUND,
    );
  }
  const updatedCategory = await prisma.category.update({
    where: { id: Number(id) },
    data,
  });
  res.status(200).json({
    message: "Category updated successfully",
    category: updatedCategory,
  });
};

export const getAllCategories = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const page = parseInt(request.query.page as string) || 0;
  const limit = parseInt(request.query.limit as string) || 5;
  const skip = page * limit;
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
    }),
    prisma.category.count({}),
  ]);
  response.status(200).json({ data: categories, total });
};

export const getCategoryById = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id } = request.params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  if (!category) {
    throw new NotFoundException(
      "Category not found with this id",
      ErrorCode.CATEGORY_NOT_FOUND,
    );
  }
  response.status(200).json({ data: category });
};

export const deleteCategory = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { id } = request.params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  if (!category) {
    throw new NotFoundException(
      "Category not found with this id",
      ErrorCode.CATEGORY_NOT_FOUND,
    );
  }
  await prisma.category.delete({
    where: { id: Number(id) },
  });
  response.status(200).json({ message: "Category deleted successfully" });
};
