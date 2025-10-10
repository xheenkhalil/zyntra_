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
            } catch (err: any) {
                console.error('%cFetch failed!', 'color: red;', err); // Checkpoint 4
                setError(err.response?.data?.message || "Failed to load exams.");
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
                        <Card key={exam.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom>{exam.title}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                    <TimerIcon sx={{ mr: 1 }} />
                                    <Typography variant="body2">{exam.duration_minutes} minutes</Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button size="large" variant="contained" fullWidth onClick={() => navigate(`/student/exam/${exam.id}`)}>
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