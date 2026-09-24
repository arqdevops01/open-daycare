"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { useKids } from "./KidsProvider";
import { ROOMS, type Room } from "@/lib/kids";

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function parseBirthDate(raw: string): Date | null {
  const match = raw.trim().match(DATE_PATTERN);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function AddKidForm() {
  const router = useRouter();
  const { addKid } = useKids();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState<Room>("Soles");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fieldClass =
    "w-full rounded-[14px] border-[1.5px] border-field-border bg-white px-4 py-[13px] text-[15px] text-ink outline-none focus:border-field-focus";
  const labelClass =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-soft";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parseBirthDate(birthDate)) {
      setError("La fecha de nacimiento debe tener el formato dd/mm/aaaa.");
      return;
    }
    setError(null);
    addKid({
      name,
      birthDate: birthDate.trim(),
      room,
      allergies: allergies.trim() || undefined,
      medicalNotes: medicalNotes.trim() || undefined,
    });
    router.push("/kids");
  };

  return (
    <form
      id="add-kid-form"
      onSubmit={handleSubmit}
      className="bg-paper px-[26px] pb-6 pt-6"
    >
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-[12px] border border-alert-icon/50 bg-alert-bg px-4 py-3 text-[13.5px] font-bold text-alert-title"
        >
          {error}
        </div>
      ) : null}

      <label htmlFor="kid-name" className={labelClass}>
        NOMBRE COMPLETO
      </label>
      <input
        id="kid-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ej. Martina López"
        required
        className={`${fieldClass} mb-[18px]`}
      />

      <div className="mb-[18px] flex gap-[14px]">
        <div className="min-w-0 flex-1">
          <label htmlFor="kid-birth-date" className={labelClass}>
            FECHA DE NACIMIENTO
          </label>
          <input
            id="kid-birth-date"
            type="text"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            placeholder="dd/mm/aaaa"
            required
            className={fieldClass}
          />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="kid-room" className={labelClass}>
            SALA
          </label>
          <div className="relative">
            <select
              id="kid-room"
              value={room}
              onChange={(event) => setRoom(event.target.value as Room)}
              className={`${fieldClass} appearance-none pr-10 font-bold`}
            >
              {ROOMS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-right"
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-photo-ink"
            />
          </div>
        </div>
      </div>

      <label htmlFor="kid-allergies" className={labelClass}>
        ALERGIAS (ETIQUETAS)
      </label>
      <input
        id="kid-allergies"
        type="text"
        value={allergies}
        onChange={(event) => setAllergies(event.target.value)}
        placeholder="Ej. Maní, Lactosa"
        className={`${fieldClass} mb-[18px]`}
      />

      <label htmlFor="kid-medical-notes" className={labelClass}>
        NOTAS MÉDICAS
      </label>
      <textarea
        id="kid-medical-notes"
        value={medicalNotes}
        onChange={(event) => setMedicalNotes(event.target.value)}
        placeholder="Indicaciones, medicación, contactos…"
        className="w-full min-h-[90px] resize-y rounded-[14px] border-[1.5px] border-field-border bg-white px-4 py-[13px] text-[15px] leading-[1.5] text-ink outline-none focus:border-field-focus"
      />
    </form>
  );
}