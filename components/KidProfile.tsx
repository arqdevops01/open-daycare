import Link from "next/link";
import { Icon } from "./Icon";
import { ParentsCard } from "./ParentsCard";
import type { Kid } from "@/lib/kids";

export function KidProfile({ kid }: { kid: Kid }) {
  return (
    <>
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-soft"
      >
        <Icon name="chevron-left" className="size-[18px]" />
        Volver a Niños
      </Link>

      <div className="flex flex-wrap items-start gap-[26px]">
        <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
          <div className="flex items-center gap-[18px]">
            <div
              className={`flex size-[84px] flex-none items-center justify-center rounded-full font-display text-[34px] font-semibold ${kid.avatarClasses}`}
            >
              {kid.initial}
            </div>
            <div className="flex-1">
              <h1 className="m-0 font-display text-[28px] font-semibold text-ink">
                {kid.name}
              </h1>
              <p className="mt-[3px] text-[15px] text-soft">
                {kid.age} años · Sala {kid.room}
              </p>
            </div>
            <a
              href="#"
              className="rounded-[12px] border-[1.5px] border-line bg-card px-4 py-[9px] text-[14px] font-bold text-nav-ink"
            >
              Editar
            </a>
          </div>

          {kid.allergies && (
            <div className="flex gap-[14px] rounded-[16px] bg-alert-bg px-[18px] py-4">
              <div className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-alert-icon text-white">
                <Icon name="alert" className="size-[22px]" />
              </div>
              <div>
                <div className="mb-[2px] text-[15px] font-extrabold text-alert-title">
                  Alergias y notas
                </div>
                <div className="text-[14.5px] leading-[1.5] text-alert-body">
                  {kid.allergies}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[16px] border border-line bg-card">
            <div className="flex justify-between border-b border-line-soft px-[18px] py-[15px]">
              <span className="text-[14.5px] text-soft">
                Fecha de nacimiento
              </span>
              <span className="text-[14.5px] font-extrabold text-ink">
                {kid.birthDate}
              </span>
            </div>
            <div className="flex justify-between border-b border-line-soft px-[18px] py-[15px]">
              <span className="text-[14.5px] text-soft">Sala</span>
              <span className="text-[14.5px] font-extrabold text-ink">
                {kid.room}
              </span>
            </div>
            <div className="flex justify-between px-[18px] py-[15px]">
              <span className="text-[14.5px] text-soft">Ingreso</span>
              <span className="text-[14.5px] font-extrabold text-ink">
                {kid.admission}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-[300px] flex-none flex-col gap-[14px]">
          <a
            href="#"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-ink py-[13px] text-[15px] font-extrabold text-white"
          >
            <Icon name="sun" className="size-[18px]" />
            Resumen del día
          </a>
          <ParentsCard parents={kid.parents} kidId={kid.id} />
        </div>
      </div>
    </>
  );
}