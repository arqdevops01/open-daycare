import Link from "next/link";
import { AddKidForm } from "@/components/AddKidForm";

export default function NewKidPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-6 py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-line bg-paper shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
          <Link
            href="/kids"
            className="text-[15px] font-bold text-soft"
          >
            Cancelar
          </Link>
          <span className="font-display text-[18px] font-semibold text-ink">
            Agregar niño
          </span>
          <button
            type="submit"
            form="add-kid-form"
            className="text-[15px] font-extrabold text-accent"
          >
            Guardar
          </button>
        </div>
        <AddKidForm />
      </div>
    </div>
  );
}