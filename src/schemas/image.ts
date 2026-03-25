import { z } from "zod";

export const imageRecordSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  isThumbnail: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export type ImageRecordInput = z.infer<typeof imageRecordSchema>;
