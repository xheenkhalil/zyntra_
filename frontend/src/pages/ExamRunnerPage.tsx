// /frontend/src/pages/ExamRunnerPage.tsx

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Paper, Button,
    RadioGroup, FormControlLabel, Radio, LinearProgress, Checkbox, FormGroup, TextField
} from '@mui/material';
import { startOrResumeExam, saveExamProgress, submitExam, getExamInfo } from '../services/studentService';
import { checkEnrollmentStatus, analyzeImage, registerViolation } from '../services/proctoringService';
import ProctoringEnrollment from '../components/ProctoringEnrollment';
import ExamInstructionsDialog from '../components/ExamInstructionsDialog';
import LatexRenderer from '../components/LatexRenderer';

// Interfaces
interface Option { text: string; }
interface Question {
    id: string;
    question_text: string;
    question_type: 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
    options: Option[] | null;
}
interface Exam {
    id: string;
    title: string;
    instructions?: string;
    questions: Question[];
}
interface Submission {
    id: string;
    answers: { [key: string]: string | string[] }; // Support array for MSQ
    time_remaining_seconds: number;
    last_question_index?: number;
}

interface ExamInfo {
    id: string;
    title: string;
    instructions?: string;
    duration_minutes: number;
    is_proctored: boolean;
}

const ExamRunnerPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    // State
    const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
    const [instructionsAcknowledged, setInstructionsAcknowledged] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [webcamReady, setWebcamReady] = useState(false);
    const submittingRef = useRef(false);

    // Tab switching detection
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [proctoringInterval, setProctoringInterval] = useState(15);

    // Webcam ref for proctoring capture
    const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
    const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- 1. Initial Load: Get Info & Enrollment Status ---
    useEffect(() => {
        if (!examId) return;

        const init = async () => {
            try {
                // Fetch exam info and enrollment status in parallel
                const [info, enrollment] = await Promise.all([
                    getExamInfo(examId),
                    checkEnrollmentStatus()
                ]);
                setExamInfo(info);
                setIsEnrolled(enrollment.enrolled);
            } catch (err: any) {
                console.error("Failed to load exam info:", err);
                setError(err.response?.data?.message || 'Failed to load exam information.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [examId]);

    // --- 2. Start Exam (After Instructions & Enrollment) ---
    useEffect(() => {
        // Only start if:
        // 1. We have examId and examInfo
        // 2. User is enrolled (only required for proctored exams)
        // 3. Instructions are acknowledged (or don't exist)
        // 4. We haven't started yet (!exam)

        if (!examId || !examInfo) return;

        // For proctored exams, wait for enrollment
        if (examInfo.is_proctored && !isEnrolled) return;

        // If instructions exist but not acknowledged, wait.
        if (examInfo.instructions && !instructionsAcknowledged) return;

        // If already loaded exam, don't reload
        if (exam) return;

        const start = async () => {
            try {
                setLoading(true); // Show loading while starting
                const data = await startOrResumeExam(examId);
                setExam(data.exam);
                setSubmission(data.submission);
                setAnswers(data.submission.answers || {});
                setTimeLeft(data.submission.time_remaining_seconds);

                // Set the dynamic proctoring interval
                if (data.exam.proctoring_interval) {
                    setProctoringInterval(data.exam.proctoring_interval);
                }

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
        start();
    }, [examId, isEnrolled, instructionsAcknowledged, examInfo, exam]);

    // --- Timer Logic ---
    // Timer only starts counting down once the proctoring webcam is ready
    // (or immediately for non-proctored exams)
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        if (examInfo?.is_proctored && !webcamReady) return;
        const timerId = setInterval(() => {
            setTimeLeft(prevTime => (prevTime ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, webcamReady, examInfo?.is_proctored]);

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
                // @ts-ignore
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
    }, 15000);

    // --- Final Submission ---
    const handleSubmit = useMemo(() => async () => {
        if (!submission || submittingRef.current) return;
        submittingRef.current = true;
        try {
            // @ts-ignore
            await submitExam(submission.id, answers);
            navigate('/student/submission-complete');
        } catch (err: unknown) {
            submittingRef.current = false; // Allow retry on genuine error
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

    useEffect(() => {
        if (!submission || !webcamVideoRef.current) return;

        // For non-proctored exams, mark webcam as ready immediately
        if (!examInfo?.is_proctored) {
            setWebcamReady(true);
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (webcamVideoRef.current) {
                    webcamVideoRef.current.srcObject = stream;
                    webcamVideoRef.current.play();
                }
                setWebcamReady(true);

                // Only start proctoring captures after webcam stream is active
                captureAndAnalyzeImage();
                proctoringIntervalRef.current = setInterval(captureAndAnalyzeImage, proctoringInterval * 1000);
            })
            .catch(err => {
                console.error('Failed to access webcam:', err);
                setWebcamReady(true); // Still allow exam to proceed
            });

        return () => {
            if (proctoringIntervalRef.current) clearInterval(proctoringIntervalRef.current);
            if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
                const tracks = (webcamVideoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [submission, proctoringInterval, examInfo?.is_proctored]);

    // --- Tab Switching Detection ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && submission && exam) {
                const newCount = tabSwitchCount + 1;
                setTabSwitchCount(newCount);
                setShowTabWarning(true);
                setTimeout(() => setShowTabWarning(false), 5000);

                // Log to backend
                registerViolation(submission.id, 'TAB_SWITCH').catch(err => 
                    console.error('Failed to register tab switch:', err)
                );

                if (newCount >= 3 && !submittingRef.current) {
                    submittingRef.current = true; // Lock immediately to prevent duplicate triggers
                    setTimeout(() => handleSubmit(), 2000);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [submission, exam, tabSwitchCount, handleSubmit]);

    // --- Mouse Leave Window Detection ---
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                if (submission && exam) {
                    registerViolation(submission.id, 'MOUSE_LEFT').catch(err =>
                        console.error('Failed to register mouse leave:', err)
                    );
                }
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [submission, exam]);

    // --- UI Handlers ---
    const handleSelectOption = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleMultiSelectOption = (questionId: string, value: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) return { ...prev, [questionId]: [...current, value] };
            return { ...prev, [questionId]: current.filter(v => v !== value) };
        });
    };

    const renderQuestionInput = (question: Question) => {
        const answer = answers[question.id];
        switch (question.question_type) {
            case 'MCQ':
            case 'TRUE_FALSE':
                return (
                    <RadioGroup value={answer || ''} onChange={(e) => handleSelectOption(question.id, e.target.value)}>
                        {question.options?.map((opt, index) => (
                            <FormControlLabel
                                key={index}
                                value={opt.text}
                                control={<Radio />}
                                label={<LatexRenderer text={opt.text} />}
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
                                control={<Checkbox checked={Array.isArray(answer) && answer.includes(opt.text)} onChange={(e) => handleMultiSelectOption(question.id, opt.text, e.target.checked)} />}
                                label={<LatexRenderer text={opt.text} />}
                                sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1, ml: 0, width: '100%' }}
                            />
                        ))}
                    </FormGroup>
                );
            case 'FILL_BLANK':
                return <TextField fullWidth variant="outlined" placeholder="Type your answer here..." value={answer || ''} onChange={(e) => handleSelectOption(question.id, e.target.value)} />;
            case 'ESSAY':
                return <TextField fullWidth multiline minRows={6} variant="outlined" placeholder="Type your essay here..." value={answer || ''} onChange={(e) => handleSelectOption(question.id, e.target.value)} />;
            default:
                return <Typography color="error">Unknown question type</Typography>;
        }
    };

    // --- Render Logic ---

    // 1. Initial Loading
    if (loading && !exam) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>{error}</Alert>;

    // 2. Enrollment / Capture (First Step — webcam permission happens here)
    if (examInfo?.is_proctored && isEnrolled === false) {
        return <ProctoringEnrollment onComplete={() => setIsEnrolled(true)} />;
    }

    // 3. Instructions (Second Step — timer starts only after "Continue to Exam")
    if (examInfo?.instructions && !instructionsAcknowledged) {
        return (
            <ExamInstructionsDialog
                open={true}
                instructions={examInfo.instructions}
                examTitle={examInfo.title}
                onContinue={() => setInstructionsAcknowledged(true)}
            />
        );
    }

    // 4. Exam UI (Third Step)
    if (!exam || !submission) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    const currentQuestion = exam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
    const minutes = Math.floor((timeLeft || 0) / 60);
    const seconds = (timeLeft || 0) % 60;

    return (
        <>
            <video ref={webcamVideoRef} style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
            {showTabWarning && (
                <Alert severity={tabSwitchCount >= 3 ? "error" : "warning"} sx={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: 400 }}>
                    {tabSwitchCount >= 3 ? `⚠️ CRITICAL: 3 tab switches detected. Auto-submitting.` : `⚠️ Warning: Tab switching detected (${tabSwitchCount}/3).`}
                </Alert>
            )}
            <Paper sx={{ p: 4, maxWidth: 900, margin: 'auto', mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h5">{exam.title}</Typography>
                        {tabSwitchCount > 0 && <Typography variant="caption" color="warning.main">⚠️ Tab switches: {tabSwitchCount}/3</Typography>}
                    </Box>
                    <Typography variant="h5" color={minutes < 5 ? 'error.main' : 'primary.main'}>
                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />
                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Question {currentQuestionIndex + 1} of {exam.questions.length}</Typography>
                    <Box sx={{ mb: 3, minHeight: '60px', fontSize: '1.1rem' }}>
                        <LatexRenderer text={currentQuestion.question_text} />
                    </Box>
                    {renderQuestionInput(currentQuestion)}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0}>Previous</Button>
                    {currentQuestionIndex === exam.questions.length - 1 ? (
                        <Button variant="contained" color="success" onClick={handleSubmit}>Submit Exam</Button>
                    ) : (
                        <Button variant="contained" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next</Button>
                    )}
                </Box>
            </Paper>
        </>
    );
};

export default ExamRunnerPage;