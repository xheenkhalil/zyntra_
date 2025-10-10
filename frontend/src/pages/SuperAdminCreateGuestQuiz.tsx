// /frontend/src/pages/SuperAdminCreateGuestQuiz.tsx

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createGuestQuiz } from '../services/superAdminGuestQuizService'; // Assuming this service exists

const SuperAdminCreateGuestQuiz: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim() || !category.trim()) {
            setError('Quiz title and category cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const newQuiz = await createGuestQuiz(title, category);
            setSuccess(`Quiz "${newQuiz.title}" created successfully! You can now add questions.`);
            // Optionally navigate to the edit/questions page for the new quiz
            navigate(`/superadmin/guest-quizzes/${newQuiz.id}/questions`); 
        } catch (err: unknown) {
            interface ErrorWithResponse {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }

            if (
                err &&
                typeof err === 'object' &&
                'response' in err &&
                (err as ErrorWithResponse).response?.data?.message
            ) {
                setError((err as ErrorWithResponse).response!.data!.message!);
            } else {
                setError('Failed to create guest quiz.');
            }
            console.error('Error creating guest quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>Create New Guest Quiz</Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Quiz Title"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <TextField
                        label="Category"
                        fullWidth
                        margin="normal"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        disabled={loading}
                    />

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/superadmin/guest-quizzes')} 
                            sx={{ mr: 2 }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {loading ? 'Creating...' : 'Create Quiz'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default SuperAdminCreateGuestQuiz;