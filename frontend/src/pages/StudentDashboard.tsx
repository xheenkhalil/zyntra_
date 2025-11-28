// /frontend/src/pages/StudentDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Card, CardContent, CardActions } from '@mui/material';
import { getAvailableExams } from '../services/studentService';
import TimerIcon from '@mui/icons-material/Timer';

interface Exam {
    id: string;
    title: string;
    duration_minutes: number;
    total_questions: number;
    question_types: string[];
}

const StudentDashboard: React.FC = () => {
    console.log('%cStudentDashboard Rendering...', 'color: orange;'); // Checkpoint 1

    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('%cuseEffect is running. Fetching exams...', 'color: blue;'); // Checkpoint 2

        const fetchExams = async () => {
            try {
                const data = await getAvailableExams();
                console.log('%cFetch successful! Data received:', 'color: green;', data); // Checkpoint 3
                setExams(data);
            } catch (err: unknown) {
                console.error('%cFetch failed!', 'color: red;', err); // Checkpoint 4
                type ErrorWithResponse = {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                };
                if (typeof err === 'object' && err !== null && 'response' in err) {
                    const errorObj = err as ErrorWithResponse;
                    setError(errorObj.response?.data?.message || "Failed to load exams.");
                } else {
                    setError("Failed to load exams.");
                }
            } finally {
                console.log('%cSetting loading to false.', 'color: purple;'); // Checkpoint 5
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    if (loading) {
        console.log('Render blocked by loading state.');
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        console.log('Render blocked by error state.');
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>My Available Exams</Typography>
            {exams.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                    {exams.map((exam) => (
                        <Card key={exam.id} className="exam-card">
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold', color: '#1E1E49' }}>{exam.title}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                                    <TimerIcon sx={{ mr: 1, color: '#3C4DCE' }} />
                                    <Typography variant="body2">{exam.duration_minutes} minutes</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <strong>Total Questions:</strong> {exam.total_questions}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Types:</strong> {exam.question_types.length > 0 ? exam.question_types.join(', ') : 'N/A'}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, mt: 'auto' }}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                                    sx={{
                                        bgcolor: '#2C31B9', // Dark Royal Blue
                                        '&:hover': { bgcolor: '#1a1f91' },
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        py: 1.5
                                    }}
                                >
                                    Start Exam
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No exams available at the moment.</Typography>
                    <Typography color="text.secondary">Please check back later.</Typography>
                </Paper>
            )}
        </Box>
    );
};

export default StudentDashboard;