"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusChangeSchema, statusHistoryUpdateSchema } from "@/schemas/status";
import type { ActionResult } from "@/types";
import type { StatusChangeInput, StatusHistoryUpdateInput } from "@/schemas/status";

export async function changeStatus(productId: string, data: StatusChangeInput): Promise<ActionResult> {
  await requireAuth();

  const result = statusChangeSchema.safeParse(data);
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { status: result.data.to },
      }),
      prisma.statusHistory.create({
        data: {
          from: product.status,
          to: result.data.to,
          note: result.data.note,
          changedAt: result.data.changedAt ?? new Date(),
          productId,
        },
      }),
    ]);

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/dashboard");
  } catch {
    return { success: false, error: "ステータスの変更に失敗しました" };
  }

  return { success: true };
}

export async function updateStatusHistory(id: string, data: StatusHistoryUpdateInput): Promise<ActionResult> {
  await requireAuth();

  const result = statusHistoryUpdateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const entry = await prisma.statusHistory.findUniqueOrThrow({
      where: { id },
      include: { product: true },
    });

    await prisma.statusHistory.update({
      where: { id },
      data: {
        from: result.data.from,
        to: result.data.to,
        note: result.data.note,
        changedAt: result.data.changedAt,
      },
    });

    revalidatePath(`/products/${entry.product.slug}/history`);
  } catch {
    return { success: false, error: "ステータス履歴の更新に失敗しました" };
  }

  return { success: true };
}

export async function deleteStatusHistory(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const entry = await prisma.statusHistory.findUniqueOrThrow({
      where: { id },
      include: { product: true },
    });

    await prisma.statusHistory.delete({ where: { id } });

    revalidatePath(`/products/${entry.product.slug}/history`);
  } catch {
    return { success: false, error: "ステータス履歴の削除に失敗しました" };
  }

  return { success: true };
}
