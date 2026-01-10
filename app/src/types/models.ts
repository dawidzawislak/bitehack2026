export interface Location {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  cuisine: string;
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
