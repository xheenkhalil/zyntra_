// /frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { zyntraTheme } from './theme';
import './index.css';

// Import Layouts
import CourseAdminLayout from './layouts/CourseAdminLayout';
import StudentLayout from './layouts/StudentLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Import Pages (ALL DIRECTLY FROM ./pages/)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SetupAccountPage from './pages/SetupAccountPage';
import GuestQuizRunner from './pages/GuestQuizRunner';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';

// --- Super Admin Pages ---
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminGuestQuizzes from './pages/SuperAdminGuestQuizzes';
import SuperAdminCreateGuestQuiz from './pages/SuperAdminCreateGuestQuiz';
import SuperAdminEditGuestQuiz from './pages/SuperAdminEditGuestQuiz';
import SuperAdminManageQuizQuestions from './pages/SuperAdminManageQuizQuestions';

import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminOrganizations from './pages/SuperAdminOrganizations';
import SuperAdminAnalytics from './pages/SuperAdminAnalytics';
import SuperAdminSystemStatus from './pages/SuperAdminSystemStatus';
import SuperAdminSettings from './pages/SuperAdminSettings';
import EnrollmentTestPage from './pages/EnrollmentTestPage';

// --- Client Admin Pages ---
import CentralAdminDashboard from './pages/CentralAdminDashboard';

// --- Course Admin (Teacher) Pages ---
import CourseAdminDashboard from './pages/CourseAdminDashboard';
import ExamBankPage from './pages/ExamBankPage';
import ExamBuilderPage from './pages/ExamBuilderPage';
import ResultsPage from './pages/ResultsPage';
import CourseAdminOverview from './pages/CourseAdminOverview';
import CourseAdminSettings from './pages/CourseAdminSettings';
import ProctoringDashboard from './pages/ProctoringDashboard';
import ProctoringOverview from './pages/ProctoringOverview';

// --- Student Pages ---
import StudentDashboard from './pages/StudentDashboard';
import ExamRunnerPage from './pages/ExamRunnerPage';
import SubmissionCompletePage from './pages/SubmissionCompletePage';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';

function App() {
    return (
        <ThemeProvider theme={zyntraTheme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* --- Public Routes --- */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/setup-account" element={<SetupAccountPage />} />
                        <Route path="/quiz/:quizId" element={<GuestQuizRunner />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/contact" element={<ContactPage />} />

                        {/* --- TEST ROUTE (For AWS Enrollment Testing) --- */}
                        {/* Temporarily public for easy testing. Later move to Student Routes. */}
                        <Route path="/test-enroll" element={<EnrollmentTestPage />} />

                        {/* --- PROCTORING ROUTE (Standalone) --- */}
                        {/* This allows both Superadmins and Course Admins to view the live feed */}
                        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'courseadmin']} />}>
                            {/* Note: This is NOT inside a layout because it has its own full-screen UI */}
                            <Route path="/proctoring/:examId" element={<ProctoringDashboard />} />
                        </Route>

                        {/* --- Protected Super Admin Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                            <Route path="/superadmin" element={<SuperAdminLayout />}>
                                <Route index element={<SuperAdminDashboard />} />

                                {/* Guest Quiz Management */}
                                <Route path="guest-quizzes" element={<SuperAdminGuestQuizzes />} />
                                <Route path="guest-quizzes/new" element={<SuperAdminCreateGuestQuiz />} />
                                <Route path="guest-quizzes/:quizId/edit" element={<SuperAdminEditGuestQuiz />} />
                                <Route path="guest-quizzes/:quizId/questions" element={<SuperAdminManageQuizQuestions />} />

                                {/* --- NEW: Added routes for all sidebar links --- */}
                                <Route path="users" element={<SuperAdminUsers />} />
                                <Route path="analytics" element={<SuperAdminAnalytics />} />
                                <Route path="organizations" element={<SuperAdminOrganizations />} />
                                <Route path="system-status" element={<SuperAdminSystemStatus />} />
                                <Route path="settings" element={<SuperAdminSettings />} />

                            </Route>
                        </Route>

                        {/* --- Protected Central Admin Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['centraladmin']} />}>
                            <Route path="/centraladmin" element={<CentralAdminDashboard />} />
                        </Route>

                        {/* --- Protected Course Admin Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['courseadmin']} />}>
                            <Route path="/courseadmin" element={<CourseAdminLayout />}>
                                <Route index element={<CourseAdminOverview />} />

                                <Route path="exams" element={<ExamBankPage />} />
                                <Route path="exams/:examId" element={<ExamBuilderPage />} />
                                <Route path="results" element={<ResultsPage />} />
                                <Route path="proctoring" element={<ProctoringOverview />} />
                                <Route path="students" element={<CourseAdminDashboard />} />
                                <Route path="settings" element={<CourseAdminSettings />} />
                            </Route>
                        </Route>

                        {/* --- Protected Student Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                            <Route path="/student" element={<StudentLayout />}>
                                <Route index element={<StudentDashboard />} />
                                <Route path="exam/:examId" element={<ExamRunnerPage />} />
                                <Route path="submission-complete" element={<SubmissionCompletePage />} />
                            </Route>
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;