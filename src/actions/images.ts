"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { imageRecordSchema, deviceTypeSchema } from "@/schemas/image";
import type { ActionResult, ImageData } from "@/types";
import type { ImageRecordInput, DeviceTypeInput } from "@/schemas/image";

type ImageCreateResult = ActionResult & { image?: ImageData };

export async function createImageRecord(productId: string, data: ImageRecordInput): Promise<ImageCreateResult> {
  await requireAuth();

  const result = imageRecordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    const created = await prisma.productImage.create({
      data: {
        url: result.data.url,
        alt: result.data.alt,
        isThumbnail: result.data.isThumbnail,
        sortOrder: result.data.sortOrder,
        deviceType: result.data.deviceType,
        productId,
      },
    });

    revalidatePath(`/products/${product.slug}/images`);
    return {
      success: true,
      image: {
        id: created.id,
        url: created.url,
        alt: created.alt,
        isThumbnail: created.isThumbnail,
        deviceType: created.deviceType,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  } catch {
    return { success: false, error: "画像の登録に失敗しました" };
  }
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

export async function updateImageAlt(imageId: string, alt: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const image = await prisma.productImage.findUniqueOrThrow({
      where: { id: imageId },
      include: { product: true },
    });

    await prisma.productImage.update({
      where: { id: imageId },
      data: { alt: alt.trim() || null },
    });

    revalidatePath(`/products/${image.product.slug}/images`);
  } catch {
    return { success: false, error: "名前の変更に失敗しました" };
  }

  return { success: true };
}

export async function replaceImage(imageId: string, newUrl: string): Promise<ActionResult> {
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

    await prisma.productImage.update({
      where: { id: imageId },
      data: { url: newUrl },
    });

    revalidatePath(`/products/${image.product.slug}/images`);
  } catch {
    return { success: false, error: "画像の変更に失敗しました" };
  }

  return { success: true };
}

export async function updateImageDeviceType(imageId: string, deviceType: DeviceTypeInput): Promise<ActionResult> {
  await requireAuth();

  const result = deviceTypeSchema.safeParse(deviceType);
  if (!result.success) {
    return { success: false, error: "無効なデバイス種別です" };
  }

  try {
    const image = await prisma.productImage.findUniqueOrThrow({
      where: { id: imageId },
      include: { product: true },
    });

    await prisma.productImage.update({
      where: { id: imageId },
      data: { deviceType: result.data },
    });

    revalidatePath(`/products/${image.product.slug}/images`);
  } catch {
    return { success: false, error: "デバイス種別の変更に失敗しました" };
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
