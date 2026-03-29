import { type ReactNode, createContext, useContext } from "react";
import { useStudioStore } from "../store/studioStore";

type StudioContextType = ReturnType<typeof useStudioStore>;

const StudioContext = createContext<StudioContextType | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const store = useStudioStore();
  return (
    <StudioContext.Provider value={store}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
