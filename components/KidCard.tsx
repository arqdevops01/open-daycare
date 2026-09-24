import { Icon } from "./Icon";
import type { Kid } from "@/lib/kids";

export function KidCard({ kid }: { kid: Kid }) {
  const parentMeta =
    kid.parents.length === 0
      ? "sin padres vinculados"
      : `${kid.parents.length} ${kid.parents.length === 1 ? "padre" : "padres"} vinculado${
          kid.parents.length === 1 ? "" : "s"
        }`;

  return (
    <a
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-line bg-card p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,.5)] transition-[0.15s] hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <div
        className={`flex size-12 flex-none items-center justify-center rounded-full font-display text-[19px] font-semibold ${kid.avatarClasses}`}
      >
        {kid.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[16px] font-semibold text-ink">
          {kid.name}
        </div>
        <div className="text-[13px] text-muted">
          {kid.age} años · {parentMeta}
        </div>
      </div>
      {kid.allergyChip ? (
        <span className="flex-none rounded-full bg-allergy-chip px-[9px] py-[5px] text-[11px] font-extrabold text-allergy-chip-ink">
          {kid.allergyChip}
        </span>
      ) : kid.parents.length === 0 ? (
        <span className="flex-none rounded-full bg-link-chip px-[9px] py-[5px] text-[11px] font-extrabold text-link-chip-ink">
          VINCULAR
        </span>
      ) : (
        <Icon name="chevron-right" className="size-[18px] flex-none text-chevron" />
      )}
    </a>
  );
}