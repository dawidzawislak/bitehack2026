import { createContext } from "react";

export interface RouteContextType {}

export const RouteContext = createContext<RouteContextType | undefined>(
  undefined
);
