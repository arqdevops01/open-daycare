"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  KIDS,
  createKid,
  createParent,
  type Kid,
  type NewKidInput,
  type NewParentInput,
} from "@/lib/kids";

interface KidsContextValue {
  kids: Kid[];
  addKid: (input: NewKidInput) => void;
  addParent: (kidId: string, input: NewParentInput) => void;
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

  const addParent = (kidId: string, input: NewParentInput) => {
    setKids((current) =>
      current.map((kid) => {
        if (kid.id !== kidId) {
          return kid;
        }
        const parent = createParent(input);
        if (!kid.parents.some((existing) => existing.id === parent.id)) {
          return { ...kid, parents: [...kid.parents, parent] };
        }
        let suffix = 2;
        let id = `${parent.id}-${suffix}`;
        while (kid.parents.some((existing) => existing.id === id)) {
          suffix += 1;
          id = `${parent.id}-${suffix}`;
        }
        return { ...kid, parents: [...kid.parents, { ...parent, id }] };
      })
    );
  };

  return (
    <KidsContext.Provider value={{ kids, addKid, addParent }}>
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