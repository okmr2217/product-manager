"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releaseSchema } from "@/schemas/release";
import type { ActionResult } from "@/types";

function parseFormData(formData: FormData) {
  return {
    version: formData.get("version"),
    title: formData.get("title"),
    content: formData.get("content"),
    releaseDate: formData.get("releaseDate"),
    type: formData.get("type"),
    isDraft: formData.get("isDraft") === "true",
  };
}

async function getProductSlug(productId: string): Promise<string> {
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { slug: true } });
  return product.slug;
}

async function getReleaseProductSlug(id: string): Promise<string> {
  const release = await prisma.release.findUniqueOrThrow({ where: { id }, select: { product: { select: { slug: true } } } });
  return release.product.slug;
}

export async function createRelease(productId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = releaseSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.release.create({ data: { ...result.data, productId } });
  } catch {
    return { success: false, error: "リリースノートの作成に失敗しました" };
  }

  const slug = await getProductSlug(productId);
  revalidatePath(`/products/${slug}/releases`);
  return { success: true };
}

export async function updateRelease(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = releaseSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.release.update({ where: { id }, data: result.data });
  } catch {
    return { success: false, error: "リリースノートの更新に失敗しました" };
  }

  const slug = await getReleaseProductSlug(id);
  revalidatePath(`/products/${slug}/releases`);
  return { success: true };
}

export async function deleteRelease(id: string): Promise<ActionResult> {
  await requireAuth();

  let slug: string;
  try {
    slug = await getReleaseProductSlug(id);
    await prisma.release.delete({ where: { id } });
  } catch {
    return { success: false, error: "リリースノートの削除に失敗しました" };
  }

  revalidatePath(`/products/${slug}/releases`);
  return { success: true };
}
