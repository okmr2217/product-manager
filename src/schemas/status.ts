import { z } from "zod";
import { PRODUCT_STATUS_VALUES } from "@/constants";

export const statusChangeSchema = z.object({
  to: z.enum(PRODUCT_STATUS_VALUES),
  note: z.string().optional(),
  changedAt: z.date().optional(),
});

export const statusHistoryUpdateSchema = z.object({
  from: z.enum(PRODUCT_STATUS_VALUES),
  to: z.enum(PRODUCT_STATUS_VALUES),
  note: z.string().optional(),
  changedAt: z.date(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
export type StatusHistoryUpdateInput = z.infer<typeof statusHistoryUpdateSchema>;
