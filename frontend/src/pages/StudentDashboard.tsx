// /frontend/src/pages/StudentDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Card, CardContent, CardActions, Divider, Chip } from '@mui/material';
import { getAvailableExams } from '../services/studentService';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';

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
                        <Card key={exam.id} className="exam-card" sx={{ borderTop: '4px solid #111A50', borderRadius: '12px' }}>
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 800, color: '#1E1E49', mb: 2.5 }}>{exam.title}</Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <TimerIcon sx={{ mr: 1.5, color: '#111A50', fontSize: 20 }} />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{exam.duration_minutes} minutes</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <AssignmentIcon sx={{ mr: 1.5, color: '#111A50', fontSize: 20 }} />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{exam.total_questions} Questions</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Question Types
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {exam.question_types.filter(Boolean).length > 0 ? (
                                            exam.question_types.filter(Boolean).map((type, idx) => (
                                                <Chip key={idx} label={String(type).replace('_', ' ')} size="small" sx={{ bgcolor: 'rgba(17, 26, 80, 0.1)', color: '#111A50', fontWeight: 600, borderRadius: '6px' }} />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                            <Divider sx={{ mx: 3, opacity: 0.6 }} />
                            <CardActions sx={{ p: 3, pt: 2, mt: 'auto' }}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                                    sx={{
                                        bgcolor: '#111A50', // Dark Royal Blue
                                        '&:hover': { bgcolor: '#080D2B' },
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