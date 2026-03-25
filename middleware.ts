import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const sessionUrl = new URL("/api/auth/get-session", request.nextUrl.origin);
    const res = await fetch(sessionUrl, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    const session = await res.json();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)"],
};
