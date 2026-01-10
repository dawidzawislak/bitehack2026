import { type ReactNode } from "react";
import { RouteContext } from "./RouteContext";

export function RouteProvider({ children }: { children: ReactNode }) {
  // states

  return (
    <RouteContext.Provider
      value={
        {
          //
        }
      }
    >
      {children}
    </RouteContext.Provider>
  );
}
