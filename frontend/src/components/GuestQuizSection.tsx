// /frontend/src/components/GuestQuizSection.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, CardActions, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { getPublicQuizzes } from '../services/guestService';

interface Quiz {
    id: string;
    title: string;
    category: string;
    participant_count: string;
    average_rating: string | null;
}

const GuestQuizSection: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPublicQuizzes();
            setQuizzes(data || []);
        } catch (err) {
            setError('Could not load public quizzes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            const ratingSubmitted = localStorage.getItem('guestQuizRatingSubmitted');
            if (ratingSubmitted === 'true') {
                console.log("Rating submitted, re-fetching quizzes to get updated stats...");
                fetchQuizzes();
                localStorage.removeItem('guestQuizRatingSubmitted');
            }
        };
        
        // Initial fetch
        fetchQuizzes();

        // Listen for when the window gets focus (e.g., user comes back to this tab)
        window.addEventListener('focus', handleFocus);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchQuizzes]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4 }}>Sharpen Your Skills</Typography>
            <Grid container spacing={3} justifyContent="center">
                {quizzes.length > 0 ? quizzes.map((quiz) => (
                    <Grid item xs={12} sm={6} md={3} key={quiz.id}>
                        <Card sx={{ borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-6px)", boxShadow: 6 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>{quiz.category}</Typography>
                                <Typography variant="h5" component="div">{quiz.title}</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mt: 2 }}>
                                    <PeopleAltIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body2">{parseInt(quiz.participant_count).toLocaleString()} took this</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mt: 1 }}>
                                    <StarIcon fontSize="small" sx={{ mr: 1, color: "#ffb400" }} />
                                    <Typography variant="body2">{quiz.average_rating ? `${quiz.average_rating} Stars` : 'Not Rated Yet'}</Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => navigate(`/quiz/${quiz.id}`)}>Start Quiz</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )) : (
                    <Typography>No public quizzes available at the moment. Check back soon!</Typography>
                )}
            </Grid>
        </Box>
    );
};

export default GuestQuizSection;