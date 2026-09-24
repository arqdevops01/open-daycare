"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { KIDS, createKid, type Kid, type NewKidInput } from "@/lib/kids";

interface KidsContextValue {
  kids: Kid[];
  addKid: (input: NewKidInput) => void;
}

const KidsContext = createContext<KidsContextValue | null>(null);

export function KidsProvider({ children }: { children: ReactNode }) {
  const [kids, setKids] = useState<Kid[]>(KIDS);

  const addKid = (input: NewKidInput) => {
    setKids((current) => {
      const kid = createKid(input);
      if (!current.some((existing) => existing.id === kid.id)) {
        return [...current, kid];
      }
      let suffix = 2;
      let id = `${kid.id}-${suffix}`;
      while (current.some((existing) => existing.id === id)) {
        suffix += 1;
        id = `${kid.id}-${suffix}`;
      }
      return [...current, { ...kid, id }];
    });
  };

  return (
    <KidsContext.Provider value={{ kids, addKid }}>
      {children}
    </KidsContext.Provider>
  );
}

export function useKids(): KidsContextValue {
  const ctx = useContext(KidsContext);
  if (!ctx) {
    throw new Error("useKids must be used within a KidsProvider");
  }
  return ctx;
}