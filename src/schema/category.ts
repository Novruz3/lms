import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  isActive: z.boolean().default(true),
  parentId: z.number().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  isActive: z.boolean().optional(),
  slug: z.string().optional(),
  parentId: z.number().optional(),
})