import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "プロダクト名は必須です"),
  slug: z.string().min(1, "スラッグは必須です").regex(/^[a-z0-9-]+$/, "小文字英数字とハイフンのみ使用できます"),
  description: z.string().min(1, "概要説明は必須です"),
  longDescription: z.string().optional(),
  category: z.enum(["APP", "MCP", "SITE"]),
  stacks: z.array(z.string()),
  repositoryUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  productUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  note: z.string().optional(),
  iconUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "有効なカラーコードを入力してください").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isPublic: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
