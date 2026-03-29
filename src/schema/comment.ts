import {z} from "zod";

export const createCOmmentSchema = z.object({
  content: z.string().min(5),
  parentId: z.number().optional(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(5),
})

export type CreateCommentInput = z.infer<typeof createCOmmentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;