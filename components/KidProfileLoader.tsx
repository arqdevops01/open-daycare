"use client";

import { notFound } from "next/navigation";
import { KidProfile } from "./KidProfile";
import { useKids } from "./KidsProvider";

export function KidProfileLoader({ id }: { id: string }) {
  const { kids } = useKids();
  const kid = kids.find((candidate) => candidate.id === id);

  if (!kid) {
    notFound();
  }

  return <KidProfile kid={kid} />;
}