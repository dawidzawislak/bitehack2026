export type PlaceCategory = "cat1" | "cat2" | "cat3";

export type CuisineType = "type1" | "type2" | "type3";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  cuisine: CuisineType;
  location: Location;
  rating: number;
}

export interface PlanDay {
  date: string;
  startHour: string;
  endHour: string;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    supper: boolean;
  };
}

export interface TourDay {
  places: Place[];
  date: string;
}
