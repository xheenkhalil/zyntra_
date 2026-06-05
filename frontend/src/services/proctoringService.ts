// frontend/src/services/proctoringService.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// --- Interfaces for the Dashboard Data ---

export interface ProctoringMetrics {
    activeCandidates: number;
    totalAlerts: number;
    verifiedSessions: number;
    aiDetections: number;
}

export interface CandidateFeed {
    submission_id: string;
    full_name: string;
    email: string;
    student_id: string;
    warning_count: number;
    time_remaining_seconds: number;
    latest_image_url: string | null;
    latest_flag_type: string | null;
}

export interface AlertLog {
    type: string;
    created_at: string;
    analysis_data: any;
    full_name: string;
    email: string;
    warning_count: number;
}

export interface HistoryRecord {
    submission_id: string;
    full_name: string;
    student_id: string;
    email: string;
    status: string;
    score_percentage: number | null;
    grade: string | null;
    warning_count: number;
    proctoring_report: any;
    submitted_at: string;
}

export interface ProctoringBatchData {
    metrics: ProctoringMetrics;
    alerts: AlertLog[];
    candidates: CandidateFeed[];
    history: HistoryRecord[];
    charts: {
        detection: { labels: string[]; data: number[] };
        threatLevel: { labels: string[]; critical: number[]; high: number[]; medium: number[] };
    };
}

// --- API Calls ---

/**
 * Fetches the complete bundle of data for the proctoring dashboard.
 * Endpoint: GET /api/proctoring/dashboard-batch/:examId
 */
export const getProctoringDashboardBatch = async (examId: string) => {
    const response = await apiClient.get(`/proctoring/dashboard-batch/${examId}`);
    return response.data as ProctoringBatchData;
};

/**
 * Manual action to flag/warn a candidate.
 */
export const warnCandidate = async (submissionId: string) => {
    const response = await apiClient.post(`/proctoring/warn-candidate/${submissionId}`);
    return response.data;
};

/**
 * Enroll a student's identity with face recognition.
 * Endpoint: POST /api/proctoring/enroll-identity
 */
export const enrollIdentity = async (base64Images: string[]) => {
    const response = await apiClient.post('/proctoring/enroll-identity', { base64Images });
    return response.data;
};

/**
 * Fetches the list of exams for the organization overview.
 * Endpoint: GET /api/proctoring/organization-overview
 */
export const getOrganizationProctoringOverview = async () => {
    const response = await apiClient.get('/proctoring/organization-overview');
    return response.data;
};

/**
 * Checks if the current student has completed identity enrollment.
 * Endpoint: GET /api/proctoring/status
 */
export const checkEnrollmentStatus = async () => {
    const response = await apiClient.get('/proctoring/status');
    return response.data as { enrolled: boolean };
};

/**
 * Sends a captured webcam image for AI proctoring analysis.
 * Endpoint: POST /api/proctoring/analyze-image
 */
export const analyzeImage = async (submissionId: string, base64Image: string) => {
    const response = await apiClient.post('/proctoring/analyze-image', {
        submission_id: submissionId,
        base64Image
    });
    return response.data;
};

/**
 * Registers a proctoring violation (tab switch, mouse leaving, etc.).
 * Endpoint: PUT /api/proctoring/register-violation
 */
export const registerViolation = async (submissionId: string, violationType: string) => {
    const response = await apiClient.put('/proctoring/register-violation', {
        submissionId,
        violationType
    });
    return response.data;
};