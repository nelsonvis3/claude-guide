"use client";
import { createContext, useContext, type ReactNode } from "react";
import { catDir, type Cat } from "./prefs";

// Color y traje de Tilde elegidos en Ajustes; los leen todas las Tilde de la página.
const CatCtx = createContext<{ cat: Cat; suit: string }>({ cat: "blanca", suit: "none" });
export const CatProvider = ({ cat, suit, children }: { cat: Cat; suit: string; children: ReactNode }) => (
  <CatCtx.Provider value={{ cat, suit }}>{children}</CatCtx.Provider>
);
export const useCatDir = () => {
  const { cat, suit } = useContext(CatCtx);
  return catDir(cat, suit);
};
