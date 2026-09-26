import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { JwtPayload } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/server";

export async function getSessionClaims(): Promise<JwtPayload | null> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getClaims();

  if (error) return null;

  return data?.claims ?? null;
}

export async function requireUser(): Promise<JwtPayload> {
  const claims = await getSessionClaims();

  if (claims === null) redirect("/login");

  return claims;
}
