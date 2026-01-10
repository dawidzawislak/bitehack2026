import { createContext } from "react";
import type {
  CuisineType,
  Location,
  PlaceCategory,
  PlanDay,
  TourDay,
} from "../types/models";

export interface RouteContextType {
  homeLocation: Location;
  planDays: PlanDay[];
  placeCategories: PlaceCategory[];
  cuisineTypes: CuisineType[];
  setHomeLocation: (location: Location) => void;
  setPlanDays: (planDays: PlanDay[]) => void;
  setPlaceCategories: (placeCategories: PlaceCategory[]) => void;
  setCuisineTypes: (cuisineTypes: CuisineType[]) => void;
  tourDays: TourDay[];
  setTourDays: (tourDays: TourDay[]) => void;
}

export const RouteContext = createContext<RouteContextType | undefined>(
  undefined
);
