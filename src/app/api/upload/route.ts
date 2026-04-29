import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;
  const type = formData.get("type") as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: "file and productId are required" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path =
    type === "icon"
      ? `${productId}/icons/icon.${ext}`
      : `${productId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: type === "icon",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);

  const url = type === "icon" ? `${publicUrl}?t=${Date.now()}` : publicUrl;
  return NextResponse.json({ url, path });
}
