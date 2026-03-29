import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(2),
  imageId: z.coerce.number().int(),
  link: z.string().min(5),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = z.object({
  title: z.string().min(2).optional(),
  imageId: z.coerce.number().int().optional(),
  link: z.string().min(5).optional(),
  isActive: z.boolean().optional(),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
