import { Icon } from "./Icon";
import type { Parent } from "@/lib/kids";

function parentMeta(parent: Parent) {
  const relation = parent.relation.toLowerCase();
  if (parent.status === "active") {
    return `${relation} · ${parent.relation === "Mamá" ? "activa" : "activo"}`;
  }
  return `${relation} · invitación enviada`;
}

export function ParentsCard({ parents }: { parents: Parent[] }) {
  return (
    <div className="rounded-[16px] border border-line bg-card px-[18px] py-4">
      <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-dimmer">
        PADRES VINCULADOS
      </div>
      <div className="flex flex-col gap-[14px]">
        {parents.map((parent) => (
          <div key={parent.id} className="flex items-center gap-3">
            <div
              className={`flex size-10 flex-none items-center justify-center rounded-full font-display text-[16px] font-semibold ${parent.avatarClasses}`}
            >
              {parent.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-extrabold text-ink">
                {parent.name}
              </div>
              <div className="text-[12.5px] text-muted">
                {parentMeta(parent)}
              </div>
            </div>
            <span
              className={`flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold ${
                parent.status === "active"
                  ? "bg-milestone-badge text-milestone-ink"
                  : "bg-pending-badge text-pending-ink"
              }`}
            >
              {parent.status === "active" ? "ACTIVA" : "PENDIENTE"}
            </span>
          </div>
        ))}
        <a href="#" className="flex items-center gap-3 pt-2">
          <span className="flex size-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-dashed-ring text-photo-ink">
            <Icon name="plus" className="size-[18px]" />
          </span>
          <span className="text-[14.5px] font-extrabold text-accent-deep">
            Vincular otro padre
          </span>
        </a>
      </div>
    </div>
  );
}