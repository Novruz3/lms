import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(5),
  isRead: z.boolean().default(false),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(2).optional(),
  message: z.string().min(5).optional(),
  isRead: z.boolean().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
