import { z } from "zod";

export const editPaymentSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED"]),
});

export type EditPaymentInput = z.infer<typeof editPaymentSchema>;
