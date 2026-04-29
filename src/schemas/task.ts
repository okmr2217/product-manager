import { z } from "zod";
import { DEV_TASK_TYPE_VALUES, DEV_TASK_STATUS_VALUES, PRIORITY_VALUES } from "@/constants";

export const taskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  type: z.enum(DEV_TASK_TYPE_VALUES),
  status: z.enum(DEV_TASK_STATUS_VALUES),
  priority: z.enum(PRIORITY_VALUES).optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;
