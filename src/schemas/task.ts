import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  type: z.enum(["FEATURE", "BUG", "IMPROVEMENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;
