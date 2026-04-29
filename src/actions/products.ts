"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { productSchema } from "@/schemas/product";
import type { ActionResult } from "@/types";

function parseFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    longDescription: formData.get("longDescription") || undefined,
    category: formData.get("category"),
    stacks: formData.getAll("stacks") as string[],
    repositoryUrl: formData.get("repositoryUrl") || undefined,
    productUrl: formData.get("productUrl") || undefined,
    note: formData.get("note") || undefined,
    iconUrl: formData.get("iconUrl") || undefined,
    themeColor: formData.get("themeColor") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isPublic: formData.get("isPublic") === "true",
  };
}

export async function createProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = productSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug: string;
  try {
    const product = await prisma.product.create({
      data: result.data,
    });
    slug = product.slug;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, fieldErrors: { slug: ["このスラッグはすでに使用されています"] } };
    }
    return { success: false, error: "プロダクトの作成に失敗しました" };
  }

  revalidatePath("/products");
  redirect(`/products/${slug}`);
}

export async function updateProduct(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const result = productSchema.safeParse(parseFormData(formData));
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug: string;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: result.data,
    });
    slug = product.slug;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, fieldErrors: { slug: ["このスラッグはすでに使用されています"] } };
    }
    return { success: false, error: "プロダクトの更新に失敗しました" };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  redirect(`/products/${slug}`);
}

export async function reorderProducts(orderedIds: string[]): Promise<ActionResult> {
  await requireAuth();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    revalidatePath("/products");
  } catch {
    return { success: false, error: "並び替えに失敗しました" };
  }

  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const { data: files } = await supabaseAdmin.storage.from("product-images").list(id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${id}/${f.name}`);
      await supabaseAdmin.storage.from("product-images").remove(paths);
    }
    const { data: iconFiles } = await supabaseAdmin.storage.from("product-images").list(`${id}/icons`);
    if (iconFiles && iconFiles.length > 0) {
      const iconPaths = iconFiles.map((f) => `${id}/icons/${f.name}`);
      await supabaseAdmin.storage.from("product-images").remove(iconPaths);
    }
    await prisma.product.delete({ where: { id } });
  } catch {
    return { success: false, error: "プロダクトの削除に失敗しました" };
  }

  revalidatePath("/products");
  redirect("/products");
}
