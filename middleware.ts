import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If trying to access a protected route without being logged in
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  // Check subscription status for pro features
  if (session && req.nextUrl.pathname.startsWith("/pro")) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status,tier")
      .eq("user_id", session.user.id)
      .single();

    const hasProAccess = 
      subscription?.status === "active" && 
      (subscription?.tier === "pro" || subscription?.tier === "enterprise");

    if (!hasProAccess) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/pricing";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check subscription status for enterprise features
  if (session && req.nextUrl.pathname.startsWith("/enterprise")) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status,tier")
      .eq("user_id", session.user.id)
      .single();

    const hasEnterpriseAccess = 
      subscription?.status === "active" && 
      subscription?.tier === "enterprise";

    if (!hasEnterpriseAccess) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/pricing";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require auth
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)",
  ],
};
