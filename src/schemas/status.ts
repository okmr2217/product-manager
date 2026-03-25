import { z } from "zod";

export const statusChangeSchema = z.object({
  to: z.enum(["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"]),
  note: z.string().optional(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
