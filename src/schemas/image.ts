import { z } from "zod";

export const deviceTypeSchema = z.enum(["PC", "MOBILE", "OTHER"]);

export const imageRecordSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  isThumbnail: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  deviceType: deviceTypeSchema.default("PC"),
});

export type ImageRecordInput = z.infer<typeof imageRecordSchema>;
export type DeviceTypeInput = z.infer<typeof deviceTypeSchema>;
