"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/schemas/task";
import type { ActionResult } from "@/types";

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    status: formData.get("status"),
    priority: formData.get("priority") || null,
  };
}

export async function createTask(productId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = taskSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let slug: string;
  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    await prisma.devTask.create({ data: { ...result.data, productId } });
    slug = product.slug;
  } catch {
    return { success: false, error: "タスクの作成に失敗しました" };
  }

  revalidatePath(`/products/${slug}/tasks`);
  redirect(`/products/${slug}/tasks`);
}

export async function updateTask(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = taskSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let slug: string;
  try {
    const task = await prisma.devTask.update({
      where: { id },
      data: result.data,
      include: { product: true },
    });
    slug = task.product.slug;
  } catch {
    return { success: false, error: "タスクの更新に失敗しました" };
  }

  revalidatePath(`/products/${slug}/tasks`);
  redirect(`/products/${slug}/tasks`);
}

export async function toggleTaskDone(id: string, done: boolean): Promise<ActionResult> {
  await requireAuth();

  try {
    const task = await prisma.devTask.update({
      where: { id },
      data: { status: done ? "DONE" : "TODO" },
      include: { product: true },
    });
    revalidatePath(`/products/${task.product.slug}/tasks`);
  } catch {
    return { success: false, error: "タスクの更新に失敗しました" };
  }

  return { success: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const task = await prisma.devTask.findUniqueOrThrow({ where: { id }, include: { product: true } });
    await prisma.devTask.delete({ where: { id } });
    revalidatePath(`/products/${task.product.slug}/tasks`);
  } catch {
    return { success: false, error: "タスクの削除に失敗しました" };
  }

  return { success: true };
}
