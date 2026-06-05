# Zyntra AI Proctoring Service - Node.js Integration Guide

This guide details how to integrate the **Zyntra AI Proctoring Service** into your main **Zyntra Exams** Node.js backend. 

---

## 1. Overview & Credentials

The Zyntra AI Proctoring Service provides database-backed, real-time computer vision auditing for student examinations. It analyzes webcam feed snapshots to identify face mismatches, secondary human presence, gaze deviations, and prohibited objects (such as mobile devices).

* **Production API Base URL:** `https://zyntra-ai-hio1.onrender.com`
* **WebSocket Protocol:** `wss://` (for real-time streaming)

### Authenticating Requests
All HTTP requests to the proctoring service require a database-backed API Key. You can authenticate using any of the following methods:
1. **Header Authentication (Recommended):**
   ```http
   X-API-Key: your_custom_api_key_here
   ```
2. **Bearer Token Authentication:**
   ```http
   Authorization: Bearer your_custom_api_key_here
   ```
3. **Query Parameter Authentication:**
   `https://zyntra-ai-hio1.onrender.com/endpoints?api_key=your_custom_api_key_here`

---

## 2. Integration Workflow

A standard proctored exam lifecycle consists of three steps: **Initialization**, **Periodic Snapshot Analysis**, and **Finalization**.

```mermaid
sequenceDiagram
    autonumber
    participant ExamsApp as Zyntra Exams Backend
    participant Client as Student Browser
    participant ProctorAPI as Zyntra AI Proctoring API

    Client->>ExamsApp: 1. Click "Start Exam"
    ExamsApp->>ProctorAPI: 2. Initialize Session (POST /session/init)
    ProctorAPI-->>ExamsApp: 3. Session Created (Active)
    ExamsApp-->>Client: 4. Launch Exam Interface
    
    loop Every 10 - 15 Seconds
        Client->>ProctorAPI: 5. Upload Webcam Frame (POST /analyze)
        ProctorAPI-->>Client: 6. Gaze & Object Risk Score
    end

    Client->>ExamsApp: 7. Submit Exam
    ExamsApp->>ProctorAPI: 8. Terminate Session (POST /session/end/{id})
    ProctorAPI-->>ExamsApp: 9. Consolidated Audit Report
    ExamsApp->>ExamsApp: 10. Store Report alongside Exam Records
```

### Step 2.1: Initialize the Session (`POST /session/init`)
Call this endpoint from your Node.js backend as soon as a student starts an exam. This creates a dedicated database session context to track violations.

* **Endpoint:** `${apiBaseUrl}/session/init`
* **Method:** `POST`
* **Headers:** `X-API-Key: <YOUR_API_KEY>`
* **Request Body (JSON):**
  ```json
  {
    "session_id": "exam_unique_session_uuid",
    "user_id": "student.email@university.edu"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "session_id": "exam_unique_session_uuid",
    "user_id": "student.email@university.edu",
    "status": "active",
    "start_time": "2026-06-05T07:15:30.123Z"
  }
  ```

### Step 2.2: Stream snapshot frames (`POST /analyze`)
While the exam is active, webcam frame snapshots should be periodically sent to the proctoring service. The client-side browser can upload directly using its API key, or route snapshots through your Node.js backend.

* **Endpoint:** `${apiBaseUrl}/analyze`
* **Method:** `POST`
* **Request Body (JSON):**
  - Provide either an `image_url` (hosted image) or `image_base64` (data URL from canvas capture).
  ```json
  {
    "session_id": "exam_unique_session_uuid",
    "user_id": "student.email@university.edu",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "face_match": true,
    "face_score": 0.94,
    "person_count": 1,
    "phone_detected": false,
    "head_pose": "center",
    "risk_score": 0,
    "violations": [],
    "snapshot_id": "generated_snapshot_uuid"
  }
  ```
  * **Violation Tags:** Possible elements in the `violations` array:
    * `LOOKING_AWAY` (Gaze anomaly)
    * `PHONE_DETECTED` (Prohibited device detection)
    * `FACE_MISMATCH` (Student verification mismatch)
    * `MULTIPLE_PEOPLE` (More than one person in frame)
    * `NO_FACE_DETECTED` (Camera blocked or student walked away)

### Step 2.3: End the Session (`POST /session/end/{session_id}`)
When the student submits their exam or the timer runs out, call this endpoint to close the proctoring session and compile the overall violation report.

* **Endpoint:** `${apiBaseUrl}/session/end/{session_id}`
* **Method:** `POST`
* **Response (200 OK):**
  ```json
  {
    "session_id": "exam_unique_session_uuid",
    "user_id": "student.email@university.edu",
    "status": "completed",
    "start_time": "2026-06-05T07:15:30.123Z",
    "end_time": "2026-06-05T07:45:30.123Z",
    "final_risk_score": 45,
    "violations_count": {
      "LOOKING_AWAY": 3,
      "PHONE_DETECTED": 1
    }
  }
  ```

---

## 3. Real-time Monitoring via WebSockets

To build a live dashboard for examiners/proctors, your Node.js server or administrative frontends can listen to the proctoring WebSocket feed.

* **WebSocket URL:** `wss://zyntra-ai-hio1.onrender.com/ws/proctor/global?api_key=<YOUR_API_KEY>`
* **Event payload structure:**
  ```json
  {
    "event": "violation",
    "session_id": "exam_unique_session_uuid",
    "user_id": "student.email@university.edu",
    "type": "PHONE_DETECTED",
    "score": 40,
    "timestamp": "07:16:45",
    "snapshot_url": "/static/snapshots/snapshot_name.jpg"
  }
  ```

---

## 4. Node.js Integration Example (Axios)

Here is a practical integration script you can drop directly into your Zyntra Exams Node.js backend routing:

```javascript
const axios = require('axios');

const ZYNTRA_API_URL = 'https://zyntra-ai-hio1.onrender.com';
const ZYNTRA_API_KEY = process.env.ZYNTRA_API_KEY;

const zyntraClient = axios.create({
  baseURL: ZYNTRA_API_URL,
  headers: {
    'X-API-Key': ZYNTRA_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Initializes a new proctored exam session context
 */
async function startExamSession(examSessionId, studentEmail) {
  try {
    const response = await zyntraClient.post('/session/init', {
      session_id: examSessionId,
      user_id: studentEmail
    });
    console.log(`[Zyntra] Session initialized: ${response.data.session_id}`);
    return response.data;
  } catch (error) {
    console.error('[Zyntra] Failed to initialize proctoring session:', error.message);
    // Fallback logic / Fail-safe handling
  }
}

/**
 * Finalizes and closes the proctored exam session, compiling the audit logs
 */
async function closeExamSession(examSessionId) {
  try {
    const response = await zyntraClient.post(`/session/end/${examSessionId}`);
    console.log(`[Zyntra] Session completed. Final Risk: ${response.data.final_risk_score}%`);
    return response.data; // Store this report in your DB alongside exam submissions
  } catch (error) {
    console.error('[Zyntra] Failed to end proctoring session:', error.message);
  }
}

module.exports = {
  startExamSession,
  closeExamSession
};
```

---

## 5. Integration Best Practices for Maximum Effectiveness

1. **Fail-Open Strategy (Resilience):**
   - **Crucial Rule:** If the Zyntra AI service experiences downtime or network errors, do NOT block the student from completing their exam. Implement `try/catch` blocks around all API calls. If the proctoring service fails, log the incident on your end and let the candidate proceed.
2. **Frequency of Captures:**
   - Stream images every **10 to 15 seconds**. Capturing more frequently (e.g., every 2 seconds) adds unnecessary load to the candidate's browser and network without significant improvements in audit quality.
3. **Grace Periods for Warnings:**
   - Gaze deviation warnings (`LOOKING_AWAY`) can occasionally trigger when students read questions closely. Avoid raising instant red flags. Design your admin console to only flag a candidate if they trigger multiple gaze violations consecutively within a short span (e.g. 3 warnings in a 60-second window).
4. **Database Archiving:**
   - Store the consolidated audit report (returned from `POST /session/end`) directly in your exams database. This preserves a lightweight, permanent summary log without requiring you to retain raw snapshot files indefinitely.
