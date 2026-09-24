"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { useKids } from "./KidsProvider";
import { NEW_PARENT_RELATIONS, type NewParentRelation } from "@/lib/kids";

export function ParentInviteForm({ kidId }: { kidId: string }) {
  const router = useRouter();
  const { addParent } = useKids();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<NewParentRelation>("Mamá");

  const fieldClass =
    "w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-4 py-[13px] text-[15px] text-ink outline-none focus:border-field-focus";
  const labelClass =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-soft";
  const pillClass = (selected: boolean) =>
    `flex-1 rounded-full border-[1.5px] py-[11px] text-[14px] font-extrabold cursor-pointer transition-colors ${
      selected
        ? "border-pill-border bg-pill-bg text-pill-ink"
        : "border-line bg-card text-nav-ink"
    }`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addParent(kidId, { name: name.trim(), email: email.trim(), relation });
    router.push(`/kids/${kidId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="parent-name" className={labelClass}>
        NOMBRE DEL PADRE/MADRE
      </label>
      <input
        id="parent-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ej. Diego Fernández"
        required
        className={`${fieldClass} mb-[18px]`}
      />

      <label htmlFor="parent-email" className={labelClass}>
        EMAIL
      </label>
      <input
        id="parent-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="correo@ejemplo.com"
        required
        className={`${fieldClass} mb-[18px]`}
      />

      <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-soft">
        PARENTESCO
      </div>
      <fieldset className="mb-5 flex gap-[9px]">
        {NEW_PARENT_RELATIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={relation === option}
            onClick={() => setRelation(option)}
            className={pillClass(relation === option)}
          >
            {option}
          </button>
        ))}
      </fieldset>

      <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-invite-border bg-invite-bg px-[18px] py-[18px] text-center">
        <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-invite-warm-ink">
          CÓDIGO DE INVITACIÓN
        </div>
        <div className="font-display text-[34px] font-semibold tracking-[7px] text-invite-ink">
          7K4P9
        </div>
        <div className="mt-[6px] text-[13px] text-invite-warm-ink">
          Vence en 7 días
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-linear-to-b from-brand-btn-a to-brand-btn-b px-6 py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
      >
        <Icon name="send" className="size-[19px]" />
        Enviar invitación
      </button>
    </form>
  );
}