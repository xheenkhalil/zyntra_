import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export interface CourseAdmin {
  id: string;
  full_name: string;
  email: string;
  username: string;
  status: 'active' | 'archived' | 'pending_setup';
  created_at: string;
}

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
export const getCourseAdmins = async (): Promise<CourseAdmin[]> => {
  try {
    const response = await apiClient.get('/centraladmin/course-admins');
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch course admins.');
    return [];
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

export const getOrganizationStats = async () => {
  try {
    const response = await apiClient.get('/centraladmin/stats');
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch organization stats.');
    // Return safe defaults on error to prevent UI crash
    return {
      totalTeachers: 0,
      totalStudents: 0,
      totalExams: 0,
      activeSessions: 0,
      teacherGrowth: "0%",
      studentGrowth: "0%",
      examGrowth: "0%"
    };
  }
};

export const getOrganizationLogs = async () => {
  try {
    const response = await apiClient.get('/centraladmin/logs');
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch organization logs.');
    return [];
  }
};

export const getOrganizationExams = async () => {
  try {
    const response = await apiClient.get('/centraladmin/exams');
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch organization exams.');
    return [];
  }
};

export const getOrganizationUsers = async (role?: string) => {
  try {
    let url = '/centraladmin/users';
    if (role) {
      url += `?role=${role}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching org users:', error);
    return null;
  }
};
