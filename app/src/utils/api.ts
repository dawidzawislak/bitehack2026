import axios from "axios";
import type { TourDay } from "../types/models";

export interface RouteRequestParams {
  minProximityThreshold: number;
  distanceMetric: string;
  metricParams: Record<string, unknown>;
  modelName?: string;
}

export interface RouteResponse {
  daysOfTour: TourDay[];
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const API = {
  route: {
    uploadFiles: async (routeParams: RouteRequestParams) => {
      const formData = new FormData();

      formData.append("request", JSON.stringify(routeParams));

      return apiClient.post("/route", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  },
  schedule: {
    get: async () => {
      // Mock data for now - will be replaced with actual API call
      return Promise.resolve({
        data: {
          schedule: [
            {
              date: "2026-01-15",
              start_location: { lat: 50.061389, lng: 19.936944 },
              end_location: { lat: 50.061389, lng: 19.936944 },
              timeline: [
                {
                  item_type: "meal",
                  scheduled_time: "09:06",
                  end_time: "10:21",
                  place: null,
                  restaurant: {
                    id: "51881ff70890f0334059aa45c5191e084940f00103f90122bfa6950100000092030ec5bb6172c3b3776b612043616665",
                    name: "Żarówka Cafe",
                    location: { lat: 50.06341859943798, lng: 19.939697800000005 },
                    category: ["food", "shopping"],
                    geoapify_categories: ["catering", "catering.cafe", "catering.cafe.coffee", "catering.cafe.coffee_shop", "internet_access", "internet_access.for_customers", "wheelchair", "wheelchair.limited"],
                    popularity: 5,
                    visit_duration_min: 75,
                    distance_km: 0.4,
                    opening_hours: "Mo-Su 09:00-20:00",
                    travel_time_min: 6,
                    formatted_address: "Żarówka Cafe, Floriańska 20, 31-021 Krakow, Poland",
                    price_level: 2,
                    meal_type: "breakfast",
                  },
                },
                {
                  item_type: "attraction",
                  scheduled_time: "10:24",
                  end_time: "11:09",
                  place: {
                    id: "51c50cab7dfcf03340596a6575314d084940f00102f901628c5802000000009203114272616d6120466c6f726961c584736b61",
                    name: "Brama Floriańska",
                    location: { lat: 50.064855749437655, lng: 19.94135270525 },
                    category: ["architecture", "history"],
                    popularity: 10,
                    visit_duration_min: 45,
                    distance_km: 0.26,
                    opening_hours: "24/7",
                    travel_time_min: 3,
                    formatted_address: "Saint Florian's Gate, Pijarska, 31-024 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.tourism", "heritage", "tourism", "tourism.attraction", "tourism.sights", "tourism.sights.city_gate", "wheelchair", "wheelchair.yes"],
                    price_level: null,
                  },
                  restaurant: null,
                },
                {
                  item_type: "meal",
                  scheduled_time: "12:11",
                  end_time: "13:26",
                  place: null,
                  restaurant: {
                    id: "517b934b885eef334059eb1ae2defc074940f00103f9017f1a2423010000009203084c616a6b6f6e696b",
                    name: "Lajkonik",
                    location: { lat: 50.062404499438195, lng: 19.935036199999995 },
                    category: ["food", "shopping"],
                    geoapify_categories: ["catering", "catering.cafe", "catering.cafe.coffee", "catering.cafe.coffee_shop"],
                    popularity: 5,
                    visit_duration_min: 75,
                    distance_km: 0.76,
                    opening_hours: "Mo-Su 07:00-20:00",
                    travel_time_min: 11,
                    formatted_address: "Lajkonik, Szewska 8, 31-010 Krakow, Poland",
                    price_level: 2,
                    meal_type: "lunch",
                  },
                },
                {
                  item_type: "attraction",
                  scheduled_time: "13:30",
                  end_time: "15:15",
                  place: {
                    id: "51383538ef02f1334059d42b56ee60084940f00101f90154f3ce000000000092030842617262616b616e",
                    name: "Barbakan",
                    location: { lat: 50.06545809943751, lng: 19.941451026175145 },
                    category: ["architecture", "art", "culture", "entertainment", "history"],
                    popularity: 10,
                    visit_duration_min: 105,
                    distance_km: 0.27,
                    opening_hours: "Mo-Su 10:30-18:00; Nov-Mar off",
                    travel_time_min: 4,
                    formatted_address: "Barbican, Basztowa, 31-157 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.tourism", "entertainment", "entertainment.museum", "fee", "heritage", "tourism", "tourism.sights", "tourism.sights.city_gate", "wheelchair", "wheelchair.limited"],
                    price_level: 2,
                  },
                  restaurant: null,
                },
                {
                  item_type: "meal",
                  scheduled_time: "16:12",
                  end_time: "17:27",
                  place: null,
                  restaurant: {
                    id: "513007e68d38ef33405964dc95d2e9074940f00103f90169d5551c0000000092031154726174746f72696120536f7072616e6f",
                    name: "Trattoria Soprano",
                    location: { lat: 50.06182319943835, lng: 19.9344567 },
                    category: ["food"],
                    geoapify_categories: ["catering", "catering.restaurant", "catering.restaurant.italian"],
                    popularity: 5,
                    visit_duration_min: 75,
                    distance_km: 0.82,
                    opening_hours: "Mo-Su 12:00-22:00",
                    travel_time_min: 12,
                    formatted_address: "Trattoria Soprano, Świętej Anny 7, 31-008 Krakow, Poland",
                    price_level: 2,
                    meal_type: "dinner",
                  },
                },
                {
                  item_type: "attraction",
                  scheduled_time: "17:34",
                  end_time: "17:56",
                  place: {
                    id: "51fcb8ccb17ff0334059c4dd1a4de4074940f00102f90143b58f010000000092033242617a796c696b6120576e6965626f777a69c499636961204e616ac59b7769c49974737a656a204d617279692050616e6e79",
                    name: "Bazylika Wniebowzięcia Najświętszej Maryi Panny",
                    location: { lat: 50.06165469943838, lng: 19.939448463898756 },
                    category: ["architecture", "history", "religion"],
                    popularity: 10,
                    visit_duration_min: 22,
                    distance_km: 0.52,
                    opening_hours: "Mo-Sa 11:30-18:00; Su 14:00-18:00",
                    travel_time_min: 7,
                    formatted_address: "St. Mary's Basilica, Plac Mariacki 5, 31-042 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.place_of_worship", "building.tourism", "heritage", "religion", "religion.place_of_worship", "religion.place_of_worship.christianity", "tourism", "tourism.attraction", "tourism.sights", "tourism.sights.place_of_worship", "tourism.sights.place_of_worship.church", "wheelchair", "wheelchair.yes"],
                    price_level: 0,
                  },
                  restaurant: null,
                },
                {
                  item_type: "attraction",
                  scheduled_time: "18:06",
                  end_time: "18:28",
                  place: {
                    id: "51098126f90ff0334059ae25ea30cb074940f00102f90149a4be01000000009203394b6fc59b6369c3b3c5822070772e20c59a7769c4997465676f20576f6a636965636861204269736b7570612069204dc499637a656e6e696b61",
                    name: "Kościół pw. Świętego Wojciecha Biskupa i Męczennika",
                    location: { lat: 50.060888399438554, lng: 19.937743732357408 },
                    category: ["architecture", "history", "religion"],
                    popularity: 10,
                    visit_duration_min: 22,
                    distance_km: 0.67,
                    opening_hours: "Mo-Sa 09:00-17:00; Su 13:30-18:00",
                    travel_time_min: 10,
                    formatted_address: "St. Adalbert's church, Main Market Square, 31-144 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.place_of_worship", "building.tourism", "heritage", "religion", "religion.place_of_worship", "religion.place_of_worship.christianity", "tourism", "tourism.attraction", "tourism.sights", "tourism.sights.place_of_worship", "tourism.sights.place_of_worship.church"],
                    price_level: 0,
                  },
                  restaurant: null,
                },
                {
                  item_type: "attraction",
                  scheduled_time: "18:43",
                  end_time: "20:28",
                  place: {
                    id: "51fc57af8599ef334059dc42a4c05d074940f00101f9015a6d1c00000000009203154d757a65756d2041726368656f6c6f6769637a6e65",
                    name: "Muzeum Archeologiczne",
                    location: { lat: 50.057548599439286, lng: 19.9359363129697 },
                    category: ["architecture", "art", "culture", "entertainment", "history"],
                    popularity: 10,
                    visit_duration_min: 105,
                    distance_km: 1.03,
                    opening_hours: "Mo-Su 10:00-16:00",
                    travel_time_min: 15,
                    formatted_address: "Archeological Museum, Poselska, 31-004 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.tourism", "entertainment", "entertainment.museum", "fee", "heritage"],
                    price_level: 2,
                  },
                  restaurant: null,
                },
              ],
              total_attractions: 5,
              total_meals: 3,
            },
            {
              date: "2026-01-16",
              start_location: { lat: 50.061389, lng: 19.936944 },
              end_location: { lat: 50.061389, lng: 19.936944 },
              timeline: [
                {
                  item_type: "attraction",
                  scheduled_time: "10:19",
                  end_time: "10:56",
                  place: {
                    id: "5126cb28017aef334059368732c9fe064940f00102f901764e1305000000009203304b6fc59b6369c3b3c5822070772e20c59a7769c49974796368205374616e6973c582617761206920576163c582617761",
                    name: "Kościół pw. Świętych Stanisława i Wacława",
                    location: { lat: 50.05465044943996, lng: 19.935455391368258 },
                    category: ["architecture", "history", "religion"],
                    popularity: 10,
                    visit_duration_min: 37,
                    distance_km: 1.31,
                    opening_hours: "Mo-Sa 06:30-17:00; Su 07:00-17:30; Apr-Oct Mo-Sa 06:30-18:00; Apr-Oct Su 07:00-18:30",
                    travel_time_min: 19,
                    formatted_address: "Royal Archcathedral Basilica of Saints Stanislaus and Wenceslaus, 1, 31-001 Krakow, Poland",
                    geoapify_categories: ["building", "building.historic", "building.place_of_worship", "building.tourism", "heritage", "religion", "religion.place_of_worship", "religion.place_of_worship.christianity", "tourism", "tourism.attraction", "tourism.sights", "tourism.sights.place_of_worship", "tourism.sights.place_of_worship.cathedral", "wheelchair", "wheelchair.yes"],
                    price_level: 0,
                  },
                  restaurant: null,
                },
                {
                  item_type: "meal",
                  scheduled_time: "12:17",
                  end_time: "13:32",
                  place: null,
                  restaurant: {
                    id: "51fb5e9e29cfed334059116c7c5127084940f00103f90108bafb6e00000000920311477265656e2043616666c3a8204e65726f",
                    name: "Green Caffè Nero",
                    location: { lat: 50.0636998994379, lng: 19.9289423 },
                    category: ["food", "shopping"],
                    geoapify_categories: ["catering", "catering.cafe", "catering.cafe.coffee", "catering.cafe.coffee_shop"],
                    popularity: 5,
                    visit_duration_min: 75,
                    distance_km: 1.15,
                    opening_hours: "Mo-Su 07:00-23:00",
                    travel_time_min: 17,
                    formatted_address: "Green Caffè Nero, Krupnicza 19a, 31-123 Krakow, Poland",
                    price_level: 2,
                    meal_type: "lunch",
                  },
                },
                {
                  item_type: "attraction",
                  scheduled_time: "13:54",
                  end_time: "15:01",
                  place: {
                    id: "51d8e1467ea1ec334059c11edaf2b6084940f00102f901873185010000000092030e5061726b204b72616b6f77736b69",
                    name: "Park Krakowski",
                    location: { lat: 50.06808314943692, lng: 19.924339191727853 },
                    category: ["history", "nature", "outdoor", "sport"],
                    popularity: 10,
                    visit_duration_min: 67,
                    distance_km: 1.52,
                    opening_hours: "24/7",
                    travel_time_min: 22,
                    formatted_address: "Park Krakowski, Krowodrza, Krakow, Poland",
                    geoapify_categories: ["access", "access.yes", "heritage", "leisure", "leisure.park"],
                    price_level: 0,
                  },
                  restaurant: null,
                },
                {
                  item_type: "meal",
                  scheduled_time: "16:12",
                  end_time: "17:27",
                  place: null,
                  restaurant: {
                    id: "51202baee06df03340591ca2290b70074940f00103f901dde7080201000000920308436f726c656f6e65",
                    name: "Corleone",
                    location: { lat: 50.05810679943917, lng: 19.939176599999996 },
                    category: ["food"],
                    geoapify_categories: ["catering", "catering.restaurant", "catering.restaurant.italian", "internet_access"],
                    popularity: 5,
                    visit_duration_min: 75,
                    distance_km: 0.84,
                    opening_hours: "Mo-Su 12:00-22:00; Fr,Sa 12:00-23:00",
                    travel_time_min: 12,
                    formatted_address: "Corleone, Poselska 19, 31-002 Krakow, Poland",
                    price_level: 2,
                    meal_type: "dinner",
                  },
                },
              ],
              total_attractions: 2,
              total_meals: 2,
            },
          ],
          total_days: 2,
          total_attractions: 7,
        },
      });
    },
  },
};

export default apiClient;
