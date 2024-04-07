import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhook/clerk", "/favicon.ico", "/assets/logo.svg"],
  ignoredRoutes: ["/api/webhook/clerk", "/assets/logo.svg"],
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
