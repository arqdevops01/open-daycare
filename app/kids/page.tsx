import Link from "next/link";
import { Icon } from "@/components/Icon";
import { KidsList } from "@/components/KidsList";
import { Sidebar } from "@/components/Sidebar";

export default function KidsPage() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar active="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
          <div className="mb-[22px] flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
                GESTIÓN
              </div>
              <h1 className="m-0 font-display text-[30px] font-semibold text-ink">
                Niños
              </h1>
            </div>
            <Link
              href="/kids/new"
              className="flex items-center gap-2 rounded-[14px] bg-linear-to-b from-brand-btn-a to-brand-btn-b px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,.7)]"
            >
              <Icon name="plus" className="size-[17px]" />
              Agregar niño
            </Link>
          </div>
          <KidsList />
        </div>
      </main>
    </div>
  );
}