"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_ERROR } from "@/app/actions/auth-messages";

export type LoginState = { error: string | null; email: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createClient(await cookies());

  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
    return { error: LOGIN_ERROR, email: "" };
  }

  const email = emailValue.trim();
  const password = passwordValue;

  if (email === "" || password.trim() === "") {
    return { error: LOGIN_ERROR, email };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: LOGIN_ERROR, email };

  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = createClient(await cookies());

  await supabase.auth.signOut();

  redirect("/login");
}
