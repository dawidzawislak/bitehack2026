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
};

export default apiClient;
