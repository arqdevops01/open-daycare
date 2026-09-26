import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refreshing the session here keeps the auth cookies fresh on every request.
  // It also gives Proxy a valid session, but authorization must still be
  // enforced in every Server Component / Server Action / Route Handler.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
