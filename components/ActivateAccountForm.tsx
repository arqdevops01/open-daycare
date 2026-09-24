"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icon";

export function ActivateAccountForm() {
  const [accepted, setAccepted] = useState(true);

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-[22px] flex size-[58px] items-center justify-center rounded-[18px] bg-linear-to-br from-brand-gradient-a to-brand-gradient-b shadow-[0_12px_26px_-10px_rgba(238,129,100,.65)]">
        <Icon name="sun" className="size-[30px]" />
      </div>
      <h1 className="mb-[8px] font-display text-[32px] leading-[1.15] font-semibold text-ink">
        Bienvenida a OpenDayCare
      </h1>
      <p className="mb-[26px] text-[15.5px] leading-[1.55] text-soft">
        Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar
        la cuenta.
      </p>

      <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-field-border bg-white px-[16px] py-[14px]">
        <div className="flex size-[44px] flex-none items-center justify-center rounded-full bg-avatar-bg font-display text-[19px] font-semibold text-avatar-ink">
          M
        </div>
        <div>
          <div className="text-[13px] text-soft">Te invitaron a seguir a</div>
          <div className="font-display text-[17px] font-semibold text-ink">
            Mateo · Sala Soles
          </div>
        </div>
      </div>

      <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-soft">
        CÓDIGO DE INVITACIÓN
      </div>
      <input
        defaultValue="7K4P9"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-[16px] py-[14px] font-display text-[18px] font-bold tracking-[3px] text-ink"
      />
      <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-soft">
        EMAIL
      </div>
      <input
        type="email"
        defaultValue="lucia.fernandez@gmail.com"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-[16px] py-[14px] text-[15px] text-ink"
      />
      <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-soft">
        CREAR CONTRASEÑA
      </div>
      <input
        type="password"
        defaultValue="contraseña"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-field-focus bg-white px-[16px] py-[14px] text-[15px] text-ink"
      />

      <label className="mb-[24px] flex cursor-pointer items-start gap-[12px] rounded-[14px] bg-invite-bg px-[16px] py-[14px]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`mt-[1px] flex size-[24px] flex-none items-center justify-center rounded-[8px] ${
            accepted ? "bg-success" : "border-[1.5px] border-field-border bg-white"
          }`}
        >
          {accepted && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[15px]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="text-[14px] leading-[1.45] text-invite-ink">
          Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de
          la app.
        </span>
      </label>

      <Link
        href="/"
        className="block w-full rounded-[15px] bg-linear-to-b from-brand-btn-a to-brand-btn-b px-6 py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
      >
        Activar mi cuenta
      </Link>
      <p className="mt-[22px] text-center text-[14.5px] text-soft">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-extrabold text-accent-deep">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}