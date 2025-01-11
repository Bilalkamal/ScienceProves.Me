// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhook(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/verify-email(.*)"
]);

const isProtectedRoute = createRouteMatcher([
  "/ask(.*)",
  "/history(.*)",
  "/api/ask(.*)",
  "/api/history(.*)"
]);

export default clerkMiddleware({
  beforeAuth: (req) => {
    // Optional: Add any logic before authentication
  },
  afterAuth: (auth, req) => {
    if (!auth.userId && !isPublicRoute(req.url)) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
    if (auth.userId && !isProtectedRoute(req.url) && isPublicRoute(req.url)) {
      const askUrl = new URL("/ask", req.url);
      return NextResponse.redirect(askUrl);
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};