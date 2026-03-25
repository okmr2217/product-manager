import { z } from "zod";

export const releaseSchema = z.object({
  version: z.string().min(1, "バージョンは必須です"),
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  releaseDate: z.coerce.date({ message: "リリース日は必須です" }),
  type: z.enum(["MAJOR", "MINOR", "PATCH", "HOTFIX"]),
  isDraft: z.boolean().default(true),
});

export type ReleaseInput = z.infer<typeof releaseSchema>;
