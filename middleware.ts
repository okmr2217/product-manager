import { betterFetch } from "@better-fetch/fetch";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "better-auth";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)"],
};
