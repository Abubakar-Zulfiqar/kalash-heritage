import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // Redirect non-admin users trying to access admin routes
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without auth
        if (req.nextUrl.pathname.startsWith("/login")) {
          return true;
        }
        // Require auth for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
