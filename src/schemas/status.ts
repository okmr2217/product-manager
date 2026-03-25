import { z } from "zod";

export const statusChangeSchema = z.object({
  to: z.enum(["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"]),
  note: z.string().optional(),
  changedAt: z.date().optional(),
});

export const statusHistoryUpdateSchema = z.object({
  from: z.enum(["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"]),
  to: z.enum(["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"]),
  note: z.string().optional(),
  changedAt: z.date(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
export type StatusHistoryUpdateInput = z.infer<typeof statusHistoryUpdateSchema>;
