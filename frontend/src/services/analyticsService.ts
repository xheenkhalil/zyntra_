// /frontend/src/services/analyticsService.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export const getCourseAdminStats = async (examId: string = "all") => {
  const response = await apiClient.get(`/analytics/course-admin`, {
    params: { examId }, // <--- send query param properly
  });
  return response.data;
};
