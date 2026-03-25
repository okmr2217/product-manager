"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusChangeSchema } from "@/schemas/status";
import type { ActionResult } from "@/types";
import type { StatusChangeInput } from "@/schemas/status";

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
