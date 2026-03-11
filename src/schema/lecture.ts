import { z } from "zod";

export const createLectureSchema = z.object({
  title: z.string().min(5),
  mediaId: z.coerce.number().int(),
  order: z.number().int(),
  free: z.boolean().optional(),
});

export const updateLectureSchema = z.object({
  title: z.string().min(5).optional(),
  mediaId: z.coerce.number().int().optional(),
  order: z.number().int().optional(),
  free: z.boolean().optional(),
});

export type CreateLectureInput = z.infer<typeof createLectureSchema>
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>
