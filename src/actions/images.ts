"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { imageRecordSchema } from "@/schemas/image";
import type { ActionResult } from "@/types";
import type { ImageRecordInput } from "@/schemas/image";

export async function createImageRecord(productId: string, data: ImageRecordInput): Promise<ActionResult> {
  await requireAuth();

  const result = imageRecordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    await prisma.productImage.create({
      data: {
        url: result.data.url,
        alt: result.data.alt,
        isThumbnail: result.data.isThumbnail,
        sortOrder: result.data.sortOrder,
        productId,
      },
    });

    revalidatePath(`/products/${product.slug}/images`);
  } catch {
    return { success: false, error: "画像の登録に失敗しました" };
  }

  return { success: true };
}

export async function deleteImage(imageId: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const image = await prisma.productImage.findUniqueOrThrow({
      where: { id: imageId },
      include: { product: true },
    });

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;
    if (image.url.startsWith(storageBaseUrl)) {
      const filePath = image.url.slice(storageBaseUrl.length);
      await supabaseAdmin.storage.from("product-images").remove([filePath]);
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    revalidatePath(`/products/${image.product.slug}/images`);
  } catch {
    return { success: false, error: "画像の削除に失敗しました" };
  }

  return { success: true };
}

export async function setThumbnail(imageId: string, productId: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId, isThumbnail: true },
        data: { isThumbnail: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isThumbnail: true },
      }),
    ]);

    revalidatePath(`/products/${product.slug}/images`);
  } catch {
    return { success: false, error: "サムネイルの設定に失敗しました" };
  }

  return { success: true };
}

export async function reorderImages(productId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireAuth();

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath(`/products/${product.slug}/images`);
  } catch {
    return { success: false, error: "並び替えに失敗しました" };
  }

  return { success: true };
}
