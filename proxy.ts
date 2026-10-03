import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

const PUBLIC_ROUTES = ["/login", "/activate-account"];

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refreshing the session here keeps the auth cookies fresh on every request.
  // It also gives Proxy a valid session, but authorization must still be
  // enforced in every Server Component / Server Action / Route Handler.
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) return supabaseResponse;

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublicRoute) return supabaseResponse;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";

  const redirectResponse = NextResponse.redirect(redirectUrl);

  // The redirect must carry the cookies the refresh above just produced.
  // Returning it without them signs the user out on the next request.
  for (const cookie of supabaseResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - any file with a static extension
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};