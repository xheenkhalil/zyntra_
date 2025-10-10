// /frontend/src/pages/SuperAdminEditGuestQuiz.tsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getGuestQuizById, updateGuestQuiz } from '../services/superAdminGuestQuizService'; // Assuming these services exist

interface GuestQuizDetails {
    id: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    average_rating: number; // Include average_rating if you want to display it
    // ... other fields if needed for display
}

const SuperAdminEditGuestQuiz: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<GuestQuizDetails | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchQuizDetails = async () => {
            if (!quizId) {
                setError('Quiz ID is missing.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError('');
                const data = await getGuestQuizById(quizId);
                setQuiz(data);
                setTitle(data.title);
                setCategory(data.category);
                setStatus(data.status);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch quiz details.');
                console.error('Error fetching quiz details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizDetails();
    }, [quizId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!quizId) {
            setError('Quiz ID is missing for update.');
            return;
        }
        if (!title.trim() || !category.trim()) {
            setError('Quiz title and category cannot be empty.');
            return;
        }

        setSaving(true);
        try {
            const updatedQuiz = await updateGuestQuiz(quizId, { title, category, status });
            setSuccess(`Quiz "${updatedQuiz.title}" updated successfully!`);
            // Optionally, refresh quiz state or navigate back
            setQuiz(updatedQuiz); // Update local state with fresh data
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update guest quiz.');
            console.error('Error updating guest quiz:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );

    if (error && !quiz) return <Alert severity="error">{error}</Alert>;
    if (!quiz) return <Alert severity="info">Quiz not found or not loaded.</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>Edit Guest Quiz: {quiz.title}</Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Quiz Title"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={saving}
                    />
                    <TextField
                        label="Category"
                        fullWidth
                        margin="normal"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        disabled={saving}
                    />
                    <TextField
                        select
                        label="Status"
                        fullWidth
                        margin="normal"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                        disabled={saving}
                    >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                    </TextField>

                    {/* Display average rating if available and relevant */}
                    {typeof quiz.average_rating === 'number' && !isNaN(quiz.average_rating) && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            **Average Rating:** {quiz.average_rating.toFixed(1)}
                        </Typography>
                    )}

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/superadmin/guest-quizzes')} 
                            sx={{ mr: 2 }}
                            disabled={saving}
                        >
                            Back to Quizzes
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default SuperAdminEditGuestQuiz;