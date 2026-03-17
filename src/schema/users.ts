import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const editMeSchema = z.object({
  name: z.string().min(2).optional(),
  password : z.string().min(6).optional(),
  imageId : z.coerce.number().int().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});