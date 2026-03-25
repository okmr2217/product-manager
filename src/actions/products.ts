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
    releaseDate: formData.get("releaseDate") || undefined,
    stacks: formData.getAll("stacks") as string[],
    repositoryUrl: formData.get("repositoryUrl") || undefined,
    productUrl: formData.get("productUrl") || undefined,
    note: formData.get("note") || undefined,
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
      data: { ...result.data, releaseDate: result.data.releaseDate ?? null },
    });
    slug = product.slug;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, fieldErrors: { slug: ["このスラッグはすでに使用されています"] } };
    }
    return { success: false, error: "プロダクトの作成に失敗しました" };
  }

  revalidatePath("/dashboard");
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
      data: { ...result.data, releaseDate: result.data.releaseDate ?? null },
    });
    slug = product.slug;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, fieldErrors: { slug: ["このスラッグはすでに使用されています"] } };
    }
    return { success: false, error: "プロダクトの更新に失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/products/${slug}`);
  redirect(`/products/${slug}`);
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const { data: files } = await supabaseAdmin.storage.from("product-images").list(id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${id}/${f.name}`);
      await supabaseAdmin.storage.from("product-images").remove(paths);
    }
    await prisma.product.delete({ where: { id } });
  } catch {
    return { success: false, error: "プロダクトの削除に失敗しました" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
