// /frontend/src/services/analyticsService.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // <--- USE ENVIRONMENT VARIABLE
  withCredentials: true,
});

export const getCourseAdminStats = async (examId: string = "all") => {
  const response = await apiClient.get(`/analytics/course-admin`, {
    params: { examId }, // <--- send query param properly
  });
  return response.data;
};
