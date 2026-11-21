import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Behind Nginx the request's own origin is the internal one (localhost:3000),
// so redirects are built from the public site URL instead.
function siteUrl(path: string, req: NextRequest) {
  return new URL(path, process.env.NEXTAUTH_URL || req.nextUrl.origin);
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const login = siteUrl("/login", req);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }

  // Signed in, but not an admin
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(siteUrl("/login?error=unauthorized", req));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
