import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/session";

export interface CurrentUserProfile {
  fullName: string;
  firstName: string;
  initial: string;
}

const FALLBACK_PROFILE: CurrentUserProfile = {
  fullName: "Usuario",
  firstName: "Usuario",
  initial: "U",
};

function buildProfile(fullName: string): CurrentUserProfile {
  const firstName = fullName.trim().split(/\s+/)[0];

  return {
    fullName,
    firstName,
    initial: firstName.charAt(0).toUpperCase(),
  };
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
  const claims = await requireUser();
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", claims.sub)
    .maybeSingle();

  if (error || !data) return FALLBACK_PROFILE;

  return buildProfile(data.full_name);
}
