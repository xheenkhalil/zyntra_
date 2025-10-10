import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://zyntraexams.onrender.com/api',
  withCredentials: true,
});

export interface CourseAdminData {
  fullName: string;
  email: string;
  username: string;
  assigned_role_details?: object;
}

// Helper for consistent error messaging
const handleError = (error: unknown, defaultMsg: string) => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.message ||
      defaultMsg;
    throw new Error(message);
  }
  throw new Error(defaultMsg);
};

// === READ ===
export const getCourseAdmins = async () => {
  try {
    const response = await apiClient.get('/centraladmin/course-admins');
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch course admins.');
  }
};

// === CREATE ===
export const createCourseAdmin = async (data: CourseAdminData) => {
  try {
    const response = await apiClient.post('/centraladmin/course-admins', data);
    // Normalize structure to prevent blank UI crashes
    const resData = response.data || {};
    return {
      setupLink: resData.setupLink || resData.data?.setupLink || null,
      user: resData.user || resData.data?.user || null,
      message: resData.message || 'Course admin created successfully.',
    };
  } catch (error) {
    handleError(error, 'Failed to create course admin.');
  }
};

// === UPDATE ===
export const updateCourseAdmin = async (userId: string, data: Partial<CourseAdminData>) => {
  try {
    const response = await apiClient.put(`/centraladmin/course-admins/${userId}`, data);
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to update course admin.');
  }
};

// === ARCHIVE ===
export const archiveCourseAdmin = async (userId: string) => {
  try {
    const response = await apiClient.put(`/centraladmin/course-admins/${userId}/archive`);
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to archive course admin.');
  }
};

// === RESTORE / UNARCHIVE ===
export const unarchiveCourseAdmin = async (userId: string) => {
  try {
    const response = await apiClient.put(`/centraladmin/course-admins/${userId}/unarchive`);
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to unarchive course admin.');
  }
};

// === DELETE ===
export const deleteCourseAdmin = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/centraladmin/course-admins/${userId}`);
    // Handle 204 No Content gracefully
    return response.data || { message: 'Course admin deleted successfully.' };
  } catch (error) {
    handleError(error, 'Failed to delete course admin.');
  }
};

// === SEND INVITE EMAIL ===
export const sendInviteEmail = async (userId: string) => {
  try {
    const response = await apiClient.post(`/centraladmin/send-invite/${userId}`);
    return response.data || { message: 'Invite email sent successfully.' };
  } catch (error) {
    handleError(error, 'Failed to send invite email.');
  }
};
