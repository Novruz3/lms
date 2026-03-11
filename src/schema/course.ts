import {z} from "zod";
import {Level, Language} from "@prisma/client";

export const createCourseSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(5),
  description: z.string().min(20),
  content: z.string().min(20),
  level: z.nativeEnum(Level),
  language: z.nativeEnum(Language),
  price: z.string().regex(/^\d+(\.\d{2})?$/),
  categoryId: z.coerce.number().int(),
  imageId: z.coerce.number().int(),
})

export const updateCourseSchema = z.object({
  title: z.string().min(5).optional(),
  slug: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  content: z.string().min(20).optional(),
  level: z.nativeEnum(Level).optional(),
  language: z.nativeEnum(Language).optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.coerce.number().int().optional(),
  imageId: z.coerce.number().int().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
