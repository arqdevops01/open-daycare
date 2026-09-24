"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "./Icon";
import { ParentInviteForm } from "./ParentInviteForm";
import { useKids } from "./KidsProvider";

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

export function ParentInviteLoader({ id }: { id: string }) {
  const { kids } = useKids();
  const kid = kids.find((candidate) => candidate.id === id);

  if (!kid) {
    notFound();
  }

  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-line bg-paper shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
      <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
        <div>
          <div className="font-display text-[18px] font-semibold text-ink">
            Vincular padre
          </div>
          <div className="text-[13px] text-muted">a {kid.name}</div>
        </div>
        <Link
          href={`/kids/${kid.id}`}
          aria-label="Cerrar"
          className="flex size-[34px] items-center justify-center rounded-[10px] bg-line-soft text-soft"
        >
          <Icon name="close" className="size-[18px]" />
        </Link>
      </div>
      <div className="px-[26px] pt-[22px] pb-6">
        <div className="mb-5 flex gap-[11px] rounded-[14px] bg-info-bg px-4 py-[13px]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-[1px] size-5 flex-none text-announcement-ink"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span className="text-[13.5px] leading-[1.45] text-info-ink">
            Le enviaremos un correo con un código para que active su cuenta.
            Solo verá el feed de {firstName(kid.name)}.
          </span>
        </div>
        <ParentInviteForm kidId={kid.id} />
      </div>
    </div>
  );
}