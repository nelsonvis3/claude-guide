"use client";
import { createContext, useContext, type ReactNode } from "react";
import { catDir, type Cat } from "./prefs";

// Color de Tilde elegido en Ajustes; lo leen todas las Tilde de la página.
const CatCtx = createContext<Cat>("blanca");
export const CatProvider = ({ cat, children }: { cat: Cat; children: ReactNode }) => <CatCtx.Provider value={cat}>{children}</CatCtx.Provider>;
export const useCatDir = () => catDir(useContext(CatCtx));
