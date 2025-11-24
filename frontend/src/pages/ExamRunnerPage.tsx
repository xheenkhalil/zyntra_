// /frontend/src/pages/ExamRunnerPage.tsx

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Paper, Button,
    RadioGroup, FormControlLabel, Radio, LinearProgress, Checkbox, FormGroup, TextField
} from '@mui/material';
import { startOrResumeExam, saveExamProgress, submitExam } from '../services/studentService';
import { checkEnrollmentStatus, analyzeImage } from '../services/proctoringService';
import ProctoringEnrollment from '../components/ProctoringEnrollment';

// Interfaces
interface Option { text: string; }
interface Question {
    id: string;
    question_text: string;
    question_type: 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
    options: Option[] | null;
}
interface Exam { id: string; title: string; questions: Question[]; }
interface Submission {
    id: string;
    answers: { [key: string]: string | string[] }; // Support array for MSQ
    time_remaining_seconds: number;
    last_question_index?: number;
}

const ExamRunnerPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Tab switching detection
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);

    // Webcam ref for proctoring capture
    const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
    const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- 1. Check Enrollment Status First ---
    useEffect(() => {
        const checkEnrollment = async () => {
            try {
                const status = await checkEnrollmentStatus();
                setIsEnrolled(status.enrolled);
            } catch (err) {
                console.error("Failed to check enrollment:", err);
                // Fallback: if check fails, assume not enrolled or show error
                setIsEnrolled(false);
            }
        };
        checkEnrollment();
    }, []);

    // --- 2. Data Fetching and Exam Start/Resume (Only if Enrolled) ---
    useEffect(() => {
        if (!examId || isEnrolled !== true) return;

        const startExam = async () => {
            try {
                const data = await startOrResumeExam(examId);
                setExam(data.exam);
                setSubmission(data.submission);
                setAnswers(data.submission.answers || {});
                setTimeLeft(data.submission.time_remaining_seconds);

                // Restore last question index if available
                if (data.submission.last_question_index !== undefined) {
                    setCurrentQuestionIndex(data.submission.last_question_index);
                }
            } catch (err: unknown) {
                type ErrorWithResponse = { response?: { data?: { message?: string } } };
                if (err && typeof err === 'object' && 'response' in err && (err as ErrorWithResponse).response?.data?.message) {
                    setError((err as ErrorWithResponse).response!.data!.message!);
                } else {
                    setError('Failed to start or resume exam.');
                }
            } finally {
                setLoading(false);
            }
        };
        startExam();
    }, [examId, isEnrolled]);

    // --- Timer Logic ---
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft(prevTime => (prevTime ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    // --- Autosave Logic ---
    const useInterval = (callback: () => void, delay: number | null) => {
        const savedCallback = useRef<() => void>(undefined);
        useEffect(() => { savedCallback.current = callback; }, [callback]);
        useEffect(() => {
            function tick() { if (savedCallback.current) savedCallback.current(); }
            if (delay !== null) {
                const id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(async () => {
        if (submission && timeLeft !== null) {
            try {
                // @ts-ignore - answers type mismatch with service (object vs specific) but it's fine for JSON
                await saveExamProgress(submission.id, {
                    answers,
                    time_remaining_seconds: timeLeft,
                    last_question_index: currentQuestionIndex
                });
                console.log('Progress saved...');
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }
    }, 15000); // Autosave every 15 seconds

    // --- Final Submission (Manual or Auto) ---
    const handleSubmit = useMemo(() => async () => {
        if (!submission) return;
        try {
            // @ts-ignore
            await submitExam(submission.id, answers);
            navigate('/student/submission-complete');
        } catch (err: unknown) {
            type ErrorWithResponse = { response?: { data?: { message?: string } } };
            if (err && typeof err === 'object' && 'response' in err && (err as ErrorWithResponse).response?.data?.message) {
                setError((err as ErrorWithResponse).response!.data!.message!);
            } else {
                setError('Failed to submit exam.');
            }
        }
    }, [submission, answers, navigate]);

    useEffect(() => {
        if (timeLeft === 0 && exam) {
            handleSubmit();
        }
    }, [timeLeft, exam, handleSubmit]);

    // --- Proctoring: Continuous Capture ---
    const captureAndAnalyzeImage = async () => {
        if (!webcamVideoRef.current || !submission) return;

        try {
            const video = webcamVideoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(video, 0, 0);
            const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

            await analyzeImage(submission.id, base64Image);
            console.log('Proctoring image captured and sent for analysis.');
        } catch (error) {
            console.error('Failed to capture/analyze proctoring image:', error);
        }
    };

    // Set up 10-minute proctoring interval when exam starts
    useEffect(() => {
        if (!submission || !webcamVideoRef.current) return;

        // Start webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (webcamVideoRef.current) {
                    webcamVideoRef.current.srcObject = stream;
                    webcamVideoRef.current.play();
                }
            })
            .catch(err => console.error('Failed to access webcam:', err));

        // Capture first image immediately, then every 10 minutes
        captureAndAnalyzeImage();
        proctoringIntervalRef.current = setInterval(captureAndAnalyzeImage, 10 * 60 * 1000);

        return () => {
            // Cleanup on unmount or exam end
            if (proctoringIntervalRef.current) {
                clearInterval(proctoringIntervalRef.current);
            }
            if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
                const tracks = (webcamVideoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [submission]);

    // --- Tab Switching Detection ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && submission && exam) {
                const newCount = tabSwitchCount + 1;
                setTabSwitchCount(newCount);
                setShowTabWarning(true);

                console.warn(`Tab switch detected! Count: ${newCount}/3`);

                // Auto-hide warning after 5 seconds
                setTimeout(() => setShowTabWarning(false), 5000);

                // Auto-submit after 3 strikes
                if (newCount >= 3) {
                    console.error('3 tab switches detected. Auto-submitting exam...');
                    setTimeout(() => {
                        handleSubmit();
                    }, 2000); // Give 2 seconds to show final warning
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [submission, exam, tabSwitchCount, handleSubmit]);

    // --- UI Handlers ---
    const handleSelectOption = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleMultiSelectOption = (questionId: string, value: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) {
                return { ...prev, [questionId]: [...current, value] };
            } else {
                return { ...prev, [questionId]: current.filter(v => v !== value) };
            }
        });
    };

    const renderQuestionInput = (question: Question) => {
        const answer = answers[question.id];

        switch (question.question_type) {
            case 'MCQ':
            case 'TRUE_FALSE':
                return (
                    <RadioGroup
                        value={answer || ''}
                        onChange={(e) => handleSelectOption(question.id, e.target.value)}
                    >
                        {question.options?.map((opt, index) => (
                            <FormControlLabel
                                key={index}
                                value={opt.text}
                                control={<Radio />}
                                label={opt.text}
                                sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1, ml: 0, width: '100%' }}
                            />
                        ))}
                    </RadioGroup>
                );
            case 'MSQ':
                return (
                    <FormGroup>
                        {question.options?.map((opt, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={Array.isArray(answer) && answer.includes(opt.text)}
                                        onChange={(e) => handleMultiSelectOption(question.id, opt.text, e.target.checked)}
                                    />
                                }
                                label={opt.text}
                                sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1, ml: 0, width: '100%' }}
                            />
                        ))}
                    </FormGroup>
                );
            case 'FILL_BLANK':
                return (
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your answer here..."
                        value={answer || ''}
                        onChange={(e) => handleSelectOption(question.id, e.target.value)}
                    />
                );
            case 'ESSAY':
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        variant="outlined"
                        placeholder="Type your essay here..."
                        value={answer || ''}
                        onChange={(e) => handleSelectOption(question.id, e.target.value)}
                    />
                );
            default:
                return <Typography color="error">Unknown question type</Typography>;
        }
    };

    // --- Render Logic ---

    // 1. Loading State (Checking enrollment)
    if (isEnrolled === null) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    // 2. Enrollment Required State
    if (isEnrolled === false) {
        return <ProctoringEnrollment onComplete={() => setIsEnrolled(true)} />;
    }

    // 3. Exam Loading State
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>{error}</Alert>;
    if (!exam || !submission || timeLeft === null) return <Alert severity="warning" sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>Could not load exam data.</Alert>;

    const currentQuestion = exam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <>
            {/* Hidden webcam video for proctoring capture */}
            <video ref={webcamVideoRef} style={{ display: 'none' }} />

            {/* Tab Switch Warning */}
            {showTabWarning && (
                <Alert
                    severity={tabSwitchCount >= 3 ? "error" : "warning"}
                    sx={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: 400 }}
                    onClose={() => setShowTabWarning(false)}
                >
                    {tabSwitchCount >= 3
                        ? `⚠️ CRITICAL: 3 tab switches detected (${tabSwitchCount}/3). Exam will be auto-submitted.`
                        : `⚠️ Warning: Tab switching detected (${tabSwitchCount}/3). Do not leave this page.`
                    }
                </Alert>
            )}

            <Paper sx={{ p: 4, maxWidth: 900, margin: 'auto', mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h5">{exam.title}</Typography>
                        {tabSwitchCount > 0 && (
                            <Typography variant="caption" color={tabSwitchCount >= 3 ? 'error' : 'warning.main'} sx={{ display: 'block', mt: 0.5 }}>
                                ⚠️ Tab switches: {tabSwitchCount}/3
                            </Typography>
                        )}
                    </Box>
                    <Typography variant="h5" color={minutes < 5 ? 'error.main' : 'primary.main'}>
                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Question {currentQuestionIndex + 1} of {exam.questions.length}</Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '60px' }}>{currentQuestion.question_text}</Typography>

                    {renderQuestionInput(currentQuestion)}

                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0}>
                        Previous
                    </Button>
                    {currentQuestionIndex === exam.questions.length - 1 ? (
                        <Button variant="contained" color="success" onClick={handleSubmit}>
                            Submit Exam
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </>
    );
};

export default ExamRunnerPage;