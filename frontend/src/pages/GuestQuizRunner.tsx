import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, CircularProgress, Alert, Paper, Button, 
    RadioGroup, FormControlLabel, Radio, LinearProgress, Rating, Container, Snackbar 
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import { getPublicQuizById, submitPublicQuiz, updateQuizRating } from '../services/guestService'; // ✅ updated import

// Snackbar Alert component
const CustomAlert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface Option { text: string; }
interface Question { id: string; question_text: string; options: Option[]; }
interface Quiz { id: string; title: string; duration_minutes: number; questions: Question[]; }
interface Result { score: number; totalQuestions: number; scorePercentage: number; }

const GuestQuizRunner: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [result, setResult] = useState<Result | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [rating, setRating] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // ===============================================================
    // FETCH QUIZ DATA
    // ===============================================================
    useEffect(() => {
        if (!quizId) return;
        getPublicQuizById(quizId)
            .then(data => {
                setQuiz(data);
                setTimeLeft(data.duration_minutes * 60);
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to load quiz.'))
            .finally(() => setLoading(false));
    }, [quizId]);

    // ===============================================================
    // SUBMIT QUIZ ANSWERS
    // ===============================================================
    const handleSubmit = useCallback(async () => {
        if (!quizId || isSubmitting) return; 
        setIsSubmitting(true);

        console.log("Submitting quiz. Answers:", answers, "Rating:", rating);

        try {
            const data = await submitPublicQuiz(quizId, answers, rating || undefined);
            setResult(data);
            localStorage.setItem('guestQuizRatingSubmitted', 'false'); // reset flag until user actually rates
        } catch (err: unknown) { 
            if (
                err &&
                typeof err === 'object' &&
                'response' in err &&
                typeof (err as { response?: unknown }).response === 'object' &&
                (err as { response?: { data?: { message?: string } } }).response?.data?.message
            ) {
                setError(
                    ((err as { response: { data: { message: string } } }).response.data.message)
                );
            } else {
                setError('Failed to submit quiz.');
            }
        } finally {
            setIsSubmitting(false); 
        }
    }, [quizId, answers, rating, isSubmitting]);

    // ===============================================================
    // AUTO TIMER HANDLING
    // ===============================================================
    useEffect(() => {
        if (timeLeft <= 0 || !quiz || result) return;
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, quiz, result]);

    useEffect(() => { 
        if (timeLeft === 0 && quiz && !result) handleSubmit();
    }, [timeLeft, quiz, result, handleSubmit]);

    // ===============================================================
    // HANDLE RATING CHANGE (NEW)
    // ===============================================================
    const handleRatingChange = async (
        _newEvent: unknown,
        newValue: number | null
    ) => {
        setRating(newValue);
        console.log("User changed rating to:", newValue);

        if (quizId && newValue && newValue >= 1 && newValue <= 5) {
            try {
                const res = await updateQuizRating(quizId, newValue);
                console.log("✅ Rating updated successfully:", res);
                setSnackbarMessage('Thank you for rating!');
                setSnackbarOpen(true);
                localStorage.setItem('guestQuizRatingSubmitted', 'true');
            } catch (error: unknown) {
                console.error("Error updating rating:", error);
                setSnackbarMessage('Failed to update rating. Please try again.');
                setSnackbarOpen(true);
            }
        }
    };

    // ===============================================================
    // SNACKBAR HANDLER
    // ===============================================================
    const handleSnackbarClose = (_?: unknown, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // ===============================================================
    // RENDERING STATES
    // ===============================================================
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!quiz) return <Alert severity="warning">Quiz not found.</Alert>;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // ===============================================================
    // RESULT VIEW
    // ===============================================================
    if (result) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>Quiz Complete!</Typography>
                    <Typography variant="h5" color="primary.main" sx={{ my: 2 }}>
                        Your Score: {result.score} / {result.totalQuestions} ({result.scorePercentage}%)
                    </Typography>
                    <Typography sx={{ mt: 3, mb: 1 }}>Rate this quiz:</Typography>
                    <Rating 
                        name="quiz-rating" 
                        value={rating} 
                        onChange={handleRatingChange} 
                        size="large" 
                    />
                    <Button 
                        variant="contained" 
                        sx={{ mt: 4 }} 
                        onClick={() => navigate('/')}
                    >
                        Back to Homepage
                    </Button>
                </Paper>

                {/* Snackbar Confirmation */}
                <Snackbar 
                    open={snackbarOpen} 
                    autoHideDuration={5000} 
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <CustomAlert 
                        onClose={handleSnackbarClose} 
                        severity="success" 
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </CustomAlert>
                </Snackbar>
            </Container>
        );
    }

    // ===============================================================
    // QUIZ RUNNER VIEW
    // ===============================================================
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">{quiz.title}</Typography>
                    <Typography variant="h5" color={minutes < 1 ? 'error.main' : 'primary.main'}>
                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </Typography>
                </Box>

                <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, minHeight: '60px' }}>
                    {currentQuestion.question_text}
                </Typography>

                <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) =>
                        setAnswers(prev => ({
                            ...prev,
                            [currentQuestion.id]: e.target.value
                        }))
                    }
                >
                    {currentQuestion.options.map((opt, index) => (
                        <FormControlLabel
                            key={index}
                            value={opt.text}
                            control={<Radio />}
                            label={opt.text}
                        />
                    ))}
                </RadioGroup>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            Submit
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default GuestQuizRunner;
