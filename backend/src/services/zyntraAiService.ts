import axios from 'axios';
import config from '../config';

const ZYNTRA_API_URL = config.ZYNTRA_API_URL;
const ZYNTRA_API_KEY = config.ZYNTRA_API_KEY;

const zyntraClient = axios.create({
  baseURL: ZYNTRA_API_URL,
  headers: {
    'X-API-Key': ZYNTRA_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

export interface ZyntraAnalyzeResponse {
  face_match: boolean;
  face_score: number;
  person_count: number;
  phone_detected: boolean;
  head_pose: string;
  risk_score: number;
  violations: string[];
  snapshot_id: string;
}

export interface ZyntraEndResponse {
  session_id: string;
  user_id: string;
  status: string;
  start_time: string;
  end_time: string;
  final_risk_score: number;
  violations_count: Record<string, number>;
}

/**
 * Initializes a new proctored exam session context in Zyntra AI
 */
export const startExamSession = async (examSessionId: string, studentEmail: string) => {
  try {
    const response = await zyntraClient.post('/session/init', {
      session_id: examSessionId,
      user_id: studentEmail,
    });
    console.log(`[Zyntra] Session initialized successfully: ${examSessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('[Zyntra] Failed to initialize proctoring session:', error.response?.data || error.message);
    // Fail-open strategy: log and return null (resilient)
    return null;
  }
};

/**
 * Sends a captured webcam image frame to Zyntra AI for analysis
 */
export const analyzeImageFrame = async (
  examSessionId: string,
  studentEmail: string,
  imageBase64: string
): Promise<ZyntraAnalyzeResponse | null> => {
  try {
    // Ensure image has the data URI scheme prefix
    const fullImageBase64 = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await zyntraClient.post('/analyze', {
      session_id: examSessionId,
      user_id: studentEmail,
      image_base64: fullImageBase64,
    });
    return response.data;
  } catch (error: any) {
    console.error('[Zyntra] Failed to analyze proctoring snapshot:', error.response?.data || error.message);
    // Fail-open strategy
    return null;
  }
};

/**
 * Finalizes and closes the proctored exam session on Zyntra AI, compiling the audit logs
 */
export const closeExamSession = async (examSessionId: string): Promise<ZyntraEndResponse | null> => {
  try {
    const response = await zyntraClient.post(`/session/end/${examSessionId}`);
    console.log(`[Zyntra] Session ended successfully: ${examSessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('[Zyntra] Failed to end proctoring session:', error.response?.data || error.message);
    return null;
  }
};
