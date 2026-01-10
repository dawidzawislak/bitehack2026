import { useState, type ReactNode } from "react";
import { RouteContext } from "./RouteContext";
import type {
  CuisineType,
  PlaceCategory,
  Location,
  PlanDay,
  TourDay,
  DaySchedule,
} from "../types/models";

export function RouteProvider({ children }: { children: ReactNode }) {
  const [homeLocation, setHomeLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [placeCategories, setPlaceCategories] = useState<PlaceCategory[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [tourDays, setTourDays] = useState<TourDay[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  return (
    <RouteContext.Provider
      value={{
        homeLocation,
        planDays,
        placeCategories,
        cuisineTypes,
        setHomeLocation,
        setPlanDays,
        setPlaceCategories,
        setCuisineTypes,
        tourDays,
        setTourDays,
        schedule,
        setSchedule,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}
