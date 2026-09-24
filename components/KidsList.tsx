"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { KidCard } from "./KidCard";
import { KIDS } from "@/lib/kids";

export function KidsList() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const kids = KIDS.filter((kid) =>
    kid.name.toLowerCase().includes(normalized)
  );

  return (
    <>
      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-line bg-card px-4 py-3">
        <Icon name="search" className="size-[18px] flex-none text-photo-ink" />
        <input
          type="text"
          placeholder="Buscar niño…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-placeholder"
        />
      </div>

      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
          SALA SOLES
        </span>
        <span className="text-[13px] text-muted">
          {kids.length} niño{kids.length === 1 ? "" : "s"}
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>

      {kids.length > 0 ? (
        <div className="grid grid-cols-2 gap-[14px]">
          {kids.map((kid) => (
            <KidCard key={kid.id} kid={kid} />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-line bg-card p-8 text-center text-[14.5px] text-muted">
          No se encontró ningún niño…
        </div>
      )}
    </>
  );
}