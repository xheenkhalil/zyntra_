// frontend/src/App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { zyntraTheme } from './theme';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';

// Import Layouts (Keep layouts eager loaded or lazy load them too - lazy is better for initial bundle)
const CourseAdminLayout = lazy(() => import('./layouts/CourseAdminLayout'));
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const CentralAdminLayout = lazy(() => import('./layouts/CentralAdminLayout'));

// Import Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SetupAccountPage = lazy(() => import('./pages/SetupAccountPage'));
const GuestQuizRunner = lazy(() => import('./pages/GuestQuizRunner'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));

// --- Solutions Pages ---
const SchoolsUniversitiesPage = lazy(() => import('./pages/solutions/SchoolsUniversitiesPage'));
const CorporateTrainingPage = lazy(() => import('./pages/solutions/CorporateTrainingPage'));
const GuestQuizzesPage = lazy(() => import('./pages/solutions/GuestQuizzesPage'));
const EarnBadgesPage = lazy(() => import('./pages/solutions/EarnBadgesPage'));

// --- Features Pages ---
const AIProctoring = lazy(() => import('./pages/features/AIProctoring'));
const SmartAnalytics = lazy(() => import('./pages/features/SmartAnalytics'));
const BiometricVerification = lazy(() => import('./pages/features/BiometricVerification'));
const MobileCompatible = lazy(() => import('./pages/features/MobileCompatible'));
const CloudIntegration = lazy(() => import('./pages/features/CloudIntegration'));
const AutoGrading = lazy(() => import('./pages/features/AutoGrading'));

// --- Super Admin Pages ---
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const SuperAdminGuestQuizzes = lazy(() => import('./pages/SuperAdminGuestQuizzes'));
const SuperAdminCreateGuestQuiz = lazy(() => import('./pages/SuperAdminCreateGuestQuiz'));
const SuperAdminEditGuestQuiz = lazy(() => import('./pages/SuperAdminEditGuestQuiz'));
const SuperAdminManageQuizQuestions = lazy(() => import('./pages/SuperAdminManageQuizQuestions'));

const SuperAdminUsers = lazy(() => import('./pages/SuperAdminUsers'));
const SuperAdminOrganizations = lazy(() => import('./pages/SuperAdminOrganizations'));
const SuperAdminAnalytics = lazy(() => import('./pages/SuperAdminAnalytics'));
const SuperAdminSystemStatus = lazy(() => import('./pages/SuperAdminSystemStatus'));
const EnrollmentTestPage = lazy(() => import('./pages/EnrollmentTestPage'));

// --- Client Admin Pages ---
const CentralAdminOverview = lazy(() => import('./pages/CentralAdminOverview'));
const CentralAdminCourseAdmins = lazy(() => import('./pages/CentralAdminCourseAdmins'));
const CentralAdminUsers = lazy(() => import('./pages/CentralAdminUsers'));
const CentralAdminExams = lazy(() => import('./pages/CentralAdminExams'));
const CentralAdminLogs = lazy(() => import('./pages/CentralAdminLogs'));
const CentralAdminSettings = lazy(() => import('./pages/CentralAdminSettings'));

// --- Course Admin (Teacher) Pages ---
const CourseAdminDashboard = lazy(() => import('./pages/CourseAdminDashboard'));
const ExamBankPage = lazy(() => import('./pages/ExamBankPage'));
const ExamBuilderPage = lazy(() => import('./pages/ExamBuilderPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const CourseAdminOverview = lazy(() => import('./pages/CourseAdminOverview'));
const CourseAdminSettings = lazy(() => import('./pages/CourseAdminSettings'));
const ProctoringDashboard = lazy(() => import('./pages/ProctoringDashboard'));
const ProctoringOverview = lazy(() => import('./pages/ProctoringOverview'));

// --- Student Pages ---
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ExamRunnerPage = lazy(() => import('./pages/ExamRunnerPage'));
const SubmissionCompletePage = lazy(() => import('./pages/SubmissionCompletePage'));

// Import Components
import ProtectedRoute from './components/ProtectedRoute';
import SEORoute from './components/SEORoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AuthProvider } from './context/AuthProvider';

function App() {
    return (
        <ThemeProvider theme={zyntraTheme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={<SEORoute path="/"><HomePage /></SEORoute>} />
                            <Route path="/login" element={<SEORoute path="/login"><LoginPage /></SEORoute>} />
                            <Route path="/setup-account" element={<SetupAccountPage />} />
                            <Route path="/quiz/:quizId" element={<GuestQuizRunner />} />
                            <Route path="/about" element={<SEORoute path="/about"><AboutPage /></SEORoute>} />
                            <Route path="/pricing" element={<SEORoute path="/pricing"><PricingPage /></SEORoute>} />
                            <Route path="/contact" element={<SEORoute path="/contact"><ContactPage /></SEORoute>} />
                            <Route path="/privacy-policy" element={<SEORoute path="/privacy-policy"><PrivacyPolicyPage /></SEORoute>} />
                            <Route path="/terms-of-service" element={<SEORoute path="/terms-of-service"><TermsOfServicePage /></SEORoute>} />
                            <Route path="/cookie-policy" element={<SEORoute path="/cookie-policy"><CookiePolicyPage /></SEORoute>} />

                            {/* --- Solutions Routes --- */}
                            <Route path="/solutions/schools-universities" element={<SEORoute path="/solutions/schools-universities"><SchoolsUniversitiesPage /></SEORoute>} />
                            <Route path="/solutions/corporate-training" element={<SEORoute path="/solutions/corporate-training"><CorporateTrainingPage /></SEORoute>} />
                            <Route path="/solutions/guest-quizzes" element={<SEORoute path="/solutions/guest-quizzes"><GuestQuizzesPage /></SEORoute>} />
                            <Route path="/solutions/earn-badges" element={<SEORoute path="/solutions/earn-badges"><EarnBadgesPage /></SEORoute>} />

                            {/* --- Features Routes --- */}
                            <Route path="/features/ai-proctoring" element={<SEORoute path="/features/ai-proctoring"><AIProctoring /></SEORoute>} />
                            <Route path="/features/smart-analytics" element={<SEORoute path="/features/smart-analytics"><SmartAnalytics /></SEORoute>} />
                            <Route path="/features/biometric-verification" element={<SEORoute path="/features/biometric-verification"><BiometricVerification /></SEORoute>} />
                            <Route path="/features/mobile-compatible" element={<SEORoute path="/features/mobile-compatible"><MobileCompatible /></SEORoute>} />
                            <Route path="/features/cloud-integration" element={<SEORoute path="/features/cloud-integration"><CloudIntegration /></SEORoute>} />
                            <Route path="/features/auto-grading" element={<SEORoute path="/features/auto-grading"><AutoGrading /></SEORoute>} />

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

                                    <Route path="exams" element={<ExamBankPage />} />
                                    <Route path="exams/:examId" element={<ExamBuilderPage />} />
                                    <Route path="results" element={<ResultsPage />} />
                                    <Route path="proctoring" element={<ProctoringOverview />} />
                                    <Route path="students" element={<CourseAdminDashboard />} />
                                    <Route path="settings" element={<CourseAdminSettings />} />
                                </Route>
                            </Route>

                            {/* --- Protected Client Admin Routes --- */}
                            <Route element={<ProtectedRoute allowedRoles={['centraladmin']} />}>
                                <Route path="/centraladmin" element={<CentralAdminLayout />}>
                                    <Route index element={<CentralAdminOverview />} />
                                    <Route path="admins" element={<CentralAdminCourseAdmins />} />
                                    <Route path="users" element={<CentralAdminUsers />} />
                                    <Route path="exams" element={<CentralAdminExams />} />
                                    <Route path="logs" element={<CentralAdminLogs />} />
                                    <Route path="settings" element={<CentralAdminSettings />} />
                                </Route>
                            </Route>

                            {/* --- Protected Course Admin Routes --- */}
                            <Route element={<ProtectedRoute allowedRoles={['courseadmin']} />}>
                                <Route path="/courseadmin" element={<CourseAdminLayout />}>
                                    <Route index element={<CourseAdminOverview />} />
                                    <Route path="students" element={<CourseAdminDashboard />} />
                                    <Route path="exams" element={<ExamBankPage />} />
                                    <Route path="exams/create" element={<ExamBuilderPage />} />
                                    <Route path="exams/:examId/edit" element={<ExamBuilderPage />} />
                                    <Route path="results" element={<ResultsPage />} />
                                    <Route path="proctoring" element={<ProctoringOverview />} />
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
                                {/* --- TEST ROUTE (For AWS Enrollment Testing) --- */}
                                <Route path="/test-enroll" element={<EnrollmentTestPage />} />
                            </Route>
                        </Routes>
                        <PWAInstallPrompt />
                    </Suspense>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;