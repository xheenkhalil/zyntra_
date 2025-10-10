// /frontend/src/pages/SuperAdminGuestQuizzes.tsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
// --- CORRECTED IMPORT STATEMENT BELOW ---
import { getAllGuestQuizzes, deleteGuestQuiz } from '../services/superAdminGuestQuizService'; 
// --- END CORRECTED IMPORT STATEMENT ---

// Interface for quiz data structure expected from backend
interface GuestQuiz {
    id: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    participant_count: number;
    // average_rating can be a number or null if no ratings exist
    average_rating: number | null; 
    created_at: string;
    updated_at: string;
}

const SuperAdminGuestQuizzes: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<GuestQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Clear previous errors
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // To track which quiz is being deleted

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        setError(''); 
        try {
            const data = await getAllGuestQuizzes();
            setQuizzes(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch guest quizzes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        navigate('/superadmin/guest-quizzes/new'); // Route for creating a new quiz
    };

    const handleEditQuiz = (quizId: string) => {
        navigate(`/superadmin/guest-quizzes/${quizId}/edit`); // Route for editing quiz details
    };

    const handleManageQuestions = (quizId: string) => {
        navigate(`/superadmin/guest-quizzes/${quizId}/questions`); // Route for managing questions
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (window.confirm('Are you sure you want to delete this quiz and ALL its associated questions and submissions? This action cannot be undone.')) {
            setDeleteLoading(quizId); // Set loading state for this specific quiz
            try {
                await deleteGuestQuiz(quizId);
                await fetchQuizzes(); // Refetch quizzes to update the list
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete quiz.');
                console.error(err);
            } finally {
                setDeleteLoading(null); // Reset loading state
            }
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ m: 4 }} />
        </Box>
    );
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">Guest Quizzes Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateQuiz}>
                    Create New Quiz
                </Button>
            </Box>

            {quizzes.length === 0 ? (
                <Alert severity="info">No guest quizzes found. Start by creating a new one!</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Participants</TableCell>
                                <TableCell align="right">Avg. Rating</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quizzes.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell>{quiz.title}</TableCell>
                                    <TableCell>{quiz.category}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={quiz.status} 
                                            color={quiz.status === 'published' ? 'success' : 'info'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell align="right">{quiz.participant_count}</TableCell>
                                    {/* --- FIX APPLIED HERE --- */}
                                    <TableCell align="right">
                                        {typeof quiz.average_rating === 'number' && !isNaN(quiz.average_rating) 
                                            ? quiz.average_rating.toFixed(1) 
                                            : 'N/A'}
                                    </TableCell>
                                    {/* --- END FIX --- */}
                                    <TableCell align="center">
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            startIcon={<EditIcon />} 
                                            sx={{ mr: 1 }} 
                                            onClick={() => handleEditQuiz(quiz.id)}
                                        >
                                            Details
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            startIcon={<VisibilityIcon />} 
                                            sx={{ mr: 1 }} 
                                            onClick={() => handleManageQuestions(quiz.id)}
                                        >
                                            Questions
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            color="error" 
                                            startIcon={<DeleteIcon />} 
                                            onClick={() => handleDeleteQuiz(quiz.id)}
                                            disabled={deleteLoading === quiz.id} // Disable button while deleting this quiz
                                        >
                                            {deleteLoading === quiz.id ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default SuperAdminGuestQuizzes;