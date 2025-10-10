// /frontend/src/pages/ExamRunnerPage.tsx

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, CircularProgress, Alert, Paper, Button, 
    RadioGroup, FormControlLabel, Radio, LinearProgress 
} from '@mui/material';
import { startOrResumeExam, saveExamProgress, submitExam } from '../services/studentService';

// Interfaces
interface Option { text: string; }
interface Question { id: string; question_text: string; options: Option[]; }
interface Exam { id: string; title: string; questions: Question[]; }
interface Submission { id: string; answers: { [key: string]: string }; time_remaining_seconds: number; }

const ExamRunnerPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // --- Data Fetching and Exam Start/Resume ---
    useEffect(() => {
        if (!examId) return;
        
        const startExam = async () => {
            try {
                const data = await startOrResumeExam(examId);
                setExam(data.exam);
                setSubmission(data.submission);
                setAnswers(data.submission.answers || {});
                setTimeLeft(data.submission.time_remaining_seconds);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to start or resume exam.');
            } finally {
                setLoading(false);
            }
        };
        startExam();
    }, [examId]);

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
        const savedCallback = useRef<() => void>();
        useEffect(() => { savedCallback.current = callback; }, [callback]);
        useEffect(() => {
            function tick() { if (savedCallback.current) savedCallback.current(); }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(async () => {
        if (submission && timeLeft !== null) {
            try {
                await saveExamProgress(submission.id, { answers, time_remaining_seconds: timeLeft });
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
            await submitExam(submission.id, answers);
            navigate('/student/submission-complete');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit exam.');
        }
    }, [submission, answers, navigate]);

    useEffect(() => {
        if (timeLeft === 0 && exam) {
            handleSubmit();
        }
    }, [timeLeft, exam, handleSubmit]);
    
    // --- UI Handlers ---
    const handleSelectOption = (questionId: string, selectedOptionText: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOptionText }));
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!exam || !submission || timeLeft === null) return <Alert severity="warning">Could not load exam data.</Alert>;

    const currentQuestion = exam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Paper sx={{ p: 4, maxWidth: 900, margin: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{exam.title}</Typography>
                <Typography variant="h5" color={minutes < 5 ? 'error.main' : 'primary.main'}>
                    {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Question {currentQuestionIndex + 1} of {exam.questions.length}</Typography>
                <Typography variant="body1" sx={{ mb: 3, minHeight: '60px' }}>{currentQuestion.question_text}</Typography>
                <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                >
                    {currentQuestion.options.map((opt, index) => (
                        <FormControlLabel key={index} value={opt.text} control={<Radio />} label={opt.text} sx={{mb: 1, border: 1, borderColor: 'divider', borderRadius: 1, ml: 0}}/>
                    ))}
                </RadioGroup>
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
    );
};

export default ExamRunnerPage;