"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, { error: null, email: "" });

  return (
    <div className="w-full max-w-[392px]">
      <h2 className="mb-[6px] font-display text-[30px] font-semibold text-ink">
        Iniciar sesión
      </h2>
      <p className="mb-[28px] text-[15px] text-soft">
        Ingresá para ver el día de hoy.
      </p>

      <form action={formAction}>
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-soft">
          EMAIL
        </div>
        <input
          name="email"
          type="email"
          required
          defaultValue={state.email}
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-[16px] py-[14px] text-[15px] text-ink"
        />
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-soft">
          CONTRASEÑA
        </div>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-[16px] py-[14px] text-[15px] text-ink"
        />

        {state.error ? (
          <div
            role="alert"
            className="mb-4 rounded-[12px] border border-alert-icon/50 bg-alert-bg px-4 py-3 text-[13.5px] font-bold text-alert-title"
          >
            {state.error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-[15px] bg-linear-to-b from-brand-btn-a to-brand-btn-b px-6 py-[15px] text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)] disabled:opacity-60"
        >
          {isPending ? "Iniciando…" : "Iniciar sesión"}
        </button>
      </form>

      <div className="mb-[20px] mt-[20px] text-right">
        <span className="cursor-pointer text-[13.5px] font-bold text-accent-deep">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      <p className="mt-[24px] text-center text-[14.5px] text-soft">
        ¿Te invitó la guardería?{" "}
        <Link href="/activate-account" className="font-extrabold text-accent-deep">
          Activá tu cuenta
        </Link>
      </p>
    </div>
  );
}
