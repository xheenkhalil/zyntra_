// /frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { zyntraTheme } from './theme';

// Import Layouts
import CourseAdminLayout from './layouts/CourseAdminLayout';
import StudentLayout from './layouts/StudentLayout';
import SuperAdminLayout from './components/SuperAdminLayout'; 

// Import Pages (ALL DIRECTLY FROM ./pages/)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CentralAdminDashboard from './pages/CentralAdminDashboard';
import SetupAccountPage from './pages/SetupAccountPage';
import CourseAdminDashboard from './pages/CourseAdminDashboard';
import ExamBankPage from './pages/ExamBankPage';
import ExamBuilderPage from './pages/ExamBuilderPage';
import StudentDashboard from './pages/StudentDashboard';
import ExamRunnerPage from './pages/ExamRunnerPage';
import ResultsPage from './pages/ResultsPage';
import SubmissionCompletePage from './pages/SubmissionCompletePage';
import CourseAdminOverview from './pages/CourseAdminOverview';
import GuestQuizRunner from './pages/GuestQuizRunner';

// --- Super Admin Guest Quiz Management Pages ---
import SuperAdminGuestQuizzes from './pages/SuperAdminGuestQuizzes';
import SuperAdminCreateGuestQuiz from './pages/SuperAdminCreateGuestQuiz'; // <-- UNCOMMENTED/ADDED
import SuperAdminEditGuestQuiz from './pages/SuperAdminEditGuestQuiz'; // <-- ADDED (assuming this name)
import SuperAdminManageQuizQuestions from './pages/SuperAdminManageQuizQuestions'; // <-- ADDED (assuming this name)

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
                        
                        {/* --- Protected Super Admin Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                            <Route path="/superadmin" element={<SuperAdminLayout />}>
                                <Route index element={<SuperAdminDashboard />} /> 
                                <Route path="guest-quizzes" element={<SuperAdminGuestQuizzes />} />
                                
                                {/* --- Super Admin Guest Quiz Management Nested Routes --- */}
                                <Route path="guest-quizzes/new" element={<SuperAdminCreateGuestQuiz />} /> 
                                <Route path="guest-quizzes/:quizId/edit" element={<SuperAdminEditGuestQuiz />} />
                                <Route path="guest-quizzes/:quizId/questions" element={<SuperAdminManageQuizQuestions />} />
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
                                <Route path="students" element={<CourseAdminDashboard />} />
                                <Route path="exams" element={<ExamBankPage />} />
                                <Route path="exams/:examId" element={<ExamBuilderPage />} />
                                <Route path="results" element={<ResultsPage />} />
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