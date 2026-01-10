import { useState, useCallback, type ReactNode, useEffect } from "react";
import type { Model, AlgorithmRun } from "@/types/models";
import { RouteContext } from "./RouteContext";
import { API } from "@/utils/api";

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
