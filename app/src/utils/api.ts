import axios from "axios";
import type { TourDay, DaySchedule } from "../types/models";

export interface RouteRequestParams {
  minProximityThreshold: number;
  distanceMetric: string;
  metricParams: Record<string, unknown>;
  modelName?: string;
}

export interface RouteResponse {
  daysOfTour: TourDay[];
}

export interface DayRequest {
  date: string;
  start_time: string;
  end_time: string;
  meals: string[];
}

export interface RecommendRequest {
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  days: DayRequest[];
  preferred_categories: string[];
  food_preferences: string[];
}

export interface RecommendResponse {
  schedule: DaySchedule[];
  total_days: number;
  total_attractions: number;
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
  recommend: {
    create: async (request: RecommendRequest): Promise<RecommendResponse> => {
      const response = await apiClient.post<RecommendResponse>("/api/recommend", request);
      return response.data;
    },
  }
};

export default apiClient;
