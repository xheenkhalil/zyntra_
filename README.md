# Zyntra Exams 🎓

Zyntra Exams is a modern, AI-powered examination platform that enables secure, proctored testing environments and intelligent grading. Built with a robust full-stack architecture, it offers both automated AI proctoring (via facial recognition & behavioral analysis) and automated grading for various question types.

## Features ✨
- **Intelligent Proctoring**: Automated KYC-style face enrollment, continuous webcam monitoring, and tab/mouse-leave violation tracking.
- **AI-Powered Analysis**: Integrates with Google Generative AI to analyze proctoring feeds for academic integrity.
- **Smart Grading**: Automatic grading of MCQs, MSQs, and Fill-in-the-Blanks, with grade scale calculations.
- **Rich Instructor Dashboard**: Insights, analytics (Chart.js), and detailed proctoring reports.
- **Modern Candidate UI**: A beautifully crafted, responsive, PWA-enabled interface built with React and Material UI.

---

## Technology Stack 🛠️

**Frontend:**
- React 19 + Vite
- Material UI (MUI) & Tailwind CSS
- React Router DOM
- Chart.js & React-Chartjs-2
- Vite PWA (Progressive Web App) Support
- KaTeX (Math Rendering)

**Backend:**
- Node.js & Express (TypeScript)
- PostgreSQL (Database)
- Redis & BullMQ (Background Job Queues)
- Google Generative AI SDK
- JWT (Authentication)
- Argon2 (Password Hashing)
- Multer (File Uploads)

---

## Setup & Installation 🚀

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis Server** (running locally or via Docker)
- A **Google Gemini API Key** (for Zyntra AI features)

### 2. Environment Variables

**Backend (`/backend/.env`)**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/zyntra_exams
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

**Frontend (`/frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:5000/api
```

### 3. Running the Project Locally

We recommend running the backend and frontend in separate terminal windows.

#### Start the Backend 🖥️
```bash
cd backend
npm install
# Run the development server
npm run dev
```

#### Start the Frontend 🎨
```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

---

## Application Structure 📂

- `/frontend`: Contains the Vite + React application. Key logic for the exam runner and UI components live here.
- `/backend`: The Express server. Contains authentication, proctoring controllers, DB services, and AI integration.
- `zyntra-ai.md` / `zyntra_pricing_model.md`: Root documentation and architecture notes regarding the AI engine.

## License
Proprietary / Internal - All rights reserved.
