// /frontend/src/pages/SuperAdminManageQuizQuestions.tsx

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Alert, CircularProgress,
    List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getGuestQuizById,
    addGuestQuizQuestion,
    updateGuestQuizQuestion,
    deleteGuestQuizQuestion
} from '../services/superAdminGuestQuizService';

// --- Type Interfaces ---
interface GuestQuiz {
    id: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    questions: GuestQuestion[];
}

interface GuestQuestion {
    id: string;
    quiz_id: string;
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
}

const SuperAdminManageQuizQuestions: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<GuestQuiz | null>(null);
    const [questions, setQuestions] = useState<GuestQuestion[]>([]);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newOptions, setNewOptions] = useState([{ text: '', isCorrect: false }]);
    const [editingQuestion, setEditingQuestion] = useState<GuestQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Fetch Quiz & Questions ---
    useEffect(() => {
        const fetchQuizAndQuestions = async () => {
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
                setQuestions(
                    (data.questions || []).map((q: GuestQuestion) => ({
                        ...q,
                        quiz_id: q.quiz_id ?? data.id,
                    }))
                );
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                    setError((err as { response: { data: { message: string } } }).response.data.message);
                } else {
                    setError('Failed to fetch quiz and questions.');
                }
                console.error('Error fetching quiz and questions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizAndQuestions();
    }, [quizId]);

    // --- Option Handlers ---
    const handleAddOption = () => setNewOptions([...newOptions, { text: '', isCorrect: false }]);

    const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        const updatedOptions = [...newOptions];
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        setNewOptions(updatedOptions);
    };

    const handleRemoveOption = (index: number) => {
        setNewOptions(newOptions.filter((_, i) => i !== index));
    };

    // --- Add or Update Question ---
    const handleAddUpdateQuestion = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        setError('');
        setSuccess('');

        if (!quizId) {
            setError('Quiz ID is missing.');
            return;
        }
        if (!newQuestionText.trim()) {
            setError('Question text cannot be empty.');
            return;
        }
        if (newOptions.filter(opt => opt.text.trim()).length < 2) {
            setError('Please provide at least two non-empty options.');
            return;
        }
        if (!newOptions.some(opt => opt.isCorrect)) {
            setError('At least one option must be marked as correct.');
            return;
        }

        setSaving(true);

        try {
            const optionsToSend = newOptions.filter(opt => opt.text.trim());
            const payload = {
                question_text: newQuestionText,
                options: optionsToSend,
            };

            console.log('Frontend Payload:', payload);

            if (editingQuestion) {
                // --- Update existing question ---
                const updatedQuestion = await updateGuestQuizQuestion(editingQuestion.id, {
                    quiz_id: editingQuestion.quiz_id,
                    question_text: newQuestionText,
                    options: optionsToSend,
                });

                const updatedQuestionWithQuizId: GuestQuestion = {
                    ...updatedQuestion,
                    quiz_id: editingQuestion.quiz_id,
                };

                setQuestions(questions.map(q =>
                    q.id === updatedQuestionWithQuizId.id ? updatedQuestionWithQuizId : q
                ));
                setSuccess('Question updated successfully!');
            } else {
                // --- Add new question ---
                const addedQuestion = await addGuestQuizQuestion(quizId, payload);

                const addedQuestionWithQuizId: GuestQuestion = {
                    ...addedQuestion,
                    quiz_id: quizId,
                };

                setQuestions([...questions, addedQuestionWithQuizId]);
                setSuccess('Question added successfully!');
            }

            // --- Reset form ---
            setNewQuestionText('');
            setNewOptions([{ text: '', isCorrect: false }]);
            setEditingQuestion(null);
        } catch (err: unknown) {
            console.error('Error saving question:', err);
            if (
                err &&
                typeof err === 'object' &&
                'response' in err &&
                err.response &&
                typeof err.response === 'object' &&
                'data' in err.response &&
                err.response.data &&
                typeof err.response.data === 'object' &&
                'message' in err.response.data
            ) {
                setError((err as { response: { data: { message: string } } }).response.data.message);
            } else {
                setError('Failed to save question.');
            }
        } finally {
            setSaving(false);
        }
    };

    // --- Edit/Delete Handlers ---
    const handleEditClick = (question: GuestQuestion) => {
        setEditingQuestion(question);
        setNewQuestionText(question.question_text);
        setNewOptions(question.options);
        setError('');
        setSuccess('');
    };

    const handleDeleteClick = async (questionId: string) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        setSaving(true);
        try {
            await deleteGuestQuizQuestion(questionId);
            setQuestions(questions.filter(q => q.id !== questionId));
            setSuccess('Question deleted successfully!');
        } catch (err: unknown) {
            if (
                err &&
                typeof err === 'object' &&
                'response' in err &&
                (err as { response?: { data?: { message?: string } } }).response !== undefined &&
                typeof (err as { response?: { data?: { message?: string } } }).response === 'object' &&
                (err as { response?: { data?: { message?: string } } }).response &&
                'data' in ((err as { response?: { data?: { message?: string } } }).response ?? {}) &&
                (err as { response: { data?: { message?: string } } }).response.data !== undefined &&
                typeof (err as { response: { data?: { message?: string } } }).response.data === 'object' &&
                'message' in ((err as { response: { data?: { message?: string } } }).response.data ?? {})
            ) {
                setError((err as { response: { data: { message: string } } }).response.data.message);
            } else {
                setError('Failed to delete question.');
            }
            console.error('Error deleting question:', err);
        } finally {
            setSaving(false);
        }
    };

    // --- UI ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !quiz) return <Alert severity="error">{error}</Alert>;
    if (!quiz) return <Alert severity="info">Quiz not found or not loaded.</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Manage Questions for: {quiz.title}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Category: {quiz.category} | Status:{' '}
                <Chip
                    label={quiz.status}
                    color={quiz.status === 'published' ? 'success' : 'info'}
                    size="small"
                />
            </Typography>

            <Paper sx={{ p: 3, mt: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </Typography>

                {/* Prevent native form submission */}
                <form onSubmit={(e) => e.preventDefault()}>
                    <TextField
                        label="Question Text"
                        fullWidth
                        margin="normal"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        required
                        disabled={saving}
                    />

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Options:</Typography>
                        {newOptions.map((option, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TextField
                                    label={`Option ${index + 1}`}
                                    fullWidth
                                    size="small"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                    sx={{ mr: 1 }}
                                    required
                                    disabled={saving}
                                />
                                <Button
                                    variant={option.isCorrect ? "contained" : "outlined"}
                                    color="success"
                                    onClick={() => handleOptionChange(index, 'isCorrect', !option.isCorrect)}
                                    size="small"
                                    sx={{ minWidth: '80px', mr: 1 }}
                                    disabled={saving}
                                >
                                    {option.isCorrect ? 'Correct' : 'Mark Correct'}
                                </Button>
                                {newOptions.length > 1 && (
                                    <IconButton color="error" onClick={() => handleRemoveOption(index)} disabled={saving}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddOption}
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                            disabled={saving}
                        >
                            Add Option
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        {editingQuestion && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setEditingQuestion(null);
                                    setNewQuestionText('');
                                    setNewOptions([{ text: '', isCorrect: false }]);
                                    setError('');
                                    setSuccess('');
                                }}
                                sx={{ mr: 2 }}
                                disabled={saving}
                            >
                                Cancel Edit
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleAddUpdateQuestion}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {saving ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Button
                variant="outlined"
                onClick={() => navigate('/superadmin/guest-quizzes')}
                sx={{ mb: 3 }}
                disabled={saving || loading}
            >
                Back to All Quizzes
            </Button>

            <Typography variant="h5" gutterBottom>Existing Questions</Typography>
            {questions.length === 0 ? (
                <Alert severity="info">No questions added to this quiz yet.</Alert>
            ) : (
                <List component={Paper} sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {questions.map((question) => (
                        <ListItem divider key={question.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <ListItemText
                                primary={question.question_text}
                                sx={{ width: '100%', mb: 1 }}
                                primaryTypographyProps={{ variant: 'h6' }}
                            />
                            <Box sx={{ width: '100%', pl: 2 }}>
                                {question.options.map((option, idx) => (
                                    <Typography
                                        key={idx}
                                        variant="body2"
                                        color={option.isCorrect ? 'success.main' : 'text.secondary'}
                                        sx={{
                                            fontWeight: option.isCorrect ? 'bold' : 'normal',
                                            '&::before': {
                                                content: option.isCorrect ? '"✅ "' : '"- "',
                                            },
                                        }}
                                    >
                                        {option.text}
                                    </Typography>
                                ))}
                            </Box>
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(question)} disabled={saving}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(question.id)} disabled={saving}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default SuperAdminManageQuizQuestions;
